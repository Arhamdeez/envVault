import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuditService {
  constructor(private prisma: PrismaService) {}

  async getFileAuditLogs(fileId: string, userId: string) {
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

    // Get all shares for this file
    const shares = await this.prisma.share.findMany({
      where: { fileId },
      select: { id: true },
    });

    const shareIds = shares.map((s) => s.id);

    // Get audit logs for all shares
    return this.prisma.auditLog.findMany({
      where: {
        shareId: {
          in: shareIds,
        },
      },
      include: {
        share: {
          select: {
            id: true,
            createdAt: true,
          },
        },
      },
      orderBy: {
        timestamp: 'desc',
      },
    });
  }
}

