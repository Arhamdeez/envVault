import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { S3Service } from '../s3/s3.service';
import { CreateFileDto } from './dto/create-file.dto';
import { randomBytes } from 'crypto';

@Injectable()
export class FilesService {
  constructor(
    private prisma: PrismaService,
    private s3Service: S3Service,
  ) {}

  async create(userId: string, createFileDto: CreateFileDto) {
    const { encryptedBlob, iv, filenameMasked, expiresAt, singleUse } = createFileDto;

    // Generate unique S3 key
    const s3Key = `files/${userId}/${Date.now()}-${randomBytes(8).toString('hex')}`;

    // Convert base64 encrypted blob to buffer
    const encryptedBuffer = Buffer.from(encryptedBlob, 'base64');

    // Upload to S3
    await this.s3Service.upload(s3Key, encryptedBuffer);

    // Create file record
    const file = await this.prisma.file.create({
      data: {
        ownerId: userId,
        s3Key,
        filenameMasked,
        iv, // Store IV for decryption
        size: encryptedBuffer.length,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        singleUse,
      },
    });

    return file;
  }

  async findOne(id: string, userId: string) {
    const file = await this.prisma.file.findUnique({
      where: { id },
      include: {
        owner: {
          select: {
            id: true,
            email: true,
          },
        },
      },
    });

    if (!file) {
      throw new NotFoundException('File not found');
    }

    // Only owner can access metadata
    if (file.ownerId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    return file;
  }

  async findAllByUser(userId: string) {
    return this.prisma.file.findMany({
      where: { ownerId: userId },
      orderBy: { createdAt: 'desc' },
      include: {
        shares: {
          select: {
            id: true,
            expiresAt: true,
            revoked: true,
            usageLimit: true,
            createdAt: true,
          },
        },
      },
    });
  }

  async getEncryptedBlob(id: string): Promise<{ blob: Buffer; iv: string }> {
    const file = await this.prisma.file.findUnique({
      where: { id },
    });

    if (!file) {
      throw new NotFoundException('File not found');
    }

    // Download encrypted blob from S3
    const blob = await this.s3Service.download(file.s3Key);

    return {
      blob,
      iv: file.iv,
    };
  }
}

