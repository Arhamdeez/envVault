import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { S3Service } from '../s3/s3.service';
import { CreateShareDto } from './dto/create-share.dto';
import { hashToken, verifyToken } from '../utils/token-hash.util';
import { randomBytes } from 'crypto';

@Injectable()
export class SharesService {
  constructor(
    private prisma: PrismaService,
    private s3Service: S3Service,
    private configService: ConfigService,
  ) {}

  async create(userId: string, createShareDto: CreateShareDto) {
    const { fileId, expiresAt, usageLimit } = createShareDto;

    // Verify file exists and belongs to user
    const file = await this.prisma.file.findUnique({
      where: { id: fileId },
    });

    if (!file) {
      throw new NotFoundException('File not found');
    }

    if (file.ownerId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    // Generate share token (plaintext, shown only once)
    const token = randomBytes(32).toString('base64url');

    // Hash token with HMAC secret
    const hmacSecret = this.configService.get<string>('TOKEN_HMAC_SECRET');
    const tokenHash = hashToken(token, hmacSecret);

    // Create share record
    const share = await this.prisma.share.create({
      data: {
        fileId,
        tokenHash,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        usageLimit: usageLimit || null,
      },
    });

    // Return plaintext token only once
    return {
      shareId: share.id,
      token, // Plaintext token - shown only once
    };
  }

  async downloadByToken(token: string, ip?: string) {
    // Hash token to look up share
    const hmacSecret = this.configService.get<string>('TOKEN_HMAC_SECRET');
    const tokenHash = hashToken(token, hmacSecret);

    // Find share
    const share = await this.prisma.share.findFirst({
      where: { tokenHash },
      include: {
        file: true,
      },
    });

    if (!share) {
      throw new NotFoundException('Share not found');
    }

    // Check if revoked
    if (share.revoked) {
      throw new ForbiddenException('Share has been revoked');
    }

    // Check expiration
    if (share.expiresAt && new Date() > share.expiresAt) {
      throw new ForbiddenException('Share has expired');
    }

    // Check usage limit
    if (share.usageLimit) {
      const accessCount = await this.prisma.auditLog.count({
        where: {
          shareId: share.id,
          action: 'download',
        },
      });

      if (accessCount >= share.usageLimit) {
        throw new ForbiddenException('Share usage limit reached');
      }
    }

    // Check file expiration
    if (share.file.expiresAt && new Date() > share.file.expiresAt) {
      throw new ForbiddenException('File has expired');
    }

    // Check single use
    if (share.file.singleUse && share.file.accessCount > 0) {
      throw new ForbiddenException('File has already been accessed');
    }

    // Download encrypted blob from S3
    const encryptedBlob = await this.s3Service.download(share.file.s3Key);

    // Log access
    await this.prisma.auditLog.create({
      data: {
        shareId: share.id,
        action: 'download',
        ip,
      },
    });

    // Increment access count
    await this.prisma.file.update({
      where: { id: share.file.id },
      data: {
        accessCount: {
          increment: 1,
        },
      },
    });

    // Return encrypted blob and metadata (NO DECRYPTION KEY)
    return {
      encryptedBlob: encryptedBlob.toString('base64'),
      iv: share.file.iv, // Include IV for decryption (not the key)
      filenameMasked: share.file.filenameMasked,
      size: share.file.size,
    };
  }

  async revoke(shareId: string, userId: string) {
    const share = await this.prisma.share.findUnique({
      where: { id: shareId },
      include: { file: true },
    });

    if (!share) {
      throw new NotFoundException('Share not found');
    }

    if (share.file.ownerId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    return this.prisma.share.update({
      where: { id: shareId },
      data: { revoked: true },
    });
  }

  async findAllByFile(fileId: string, userId: string) {
    const file = await this.prisma.file.findUnique({
      where: { id: fileId },
    });

    if (!file) {
      throw new NotFoundException('File not found');
    }

    if (file.ownerId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    return this.prisma.share.findMany({
      where: { fileId },
      include: {
        _count: {
          select: {
            auditLogs: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}

