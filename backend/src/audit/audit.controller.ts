import { Controller, Get, Param, UseGuards, Request } from '@nestjs/common';
import { AuditService } from './audit.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('audit')
@UseGuards(JwtAuthGuard)
export class AuditController {
  constructor(private auditService: AuditService) {}

  @Get('file/:fileId')
  async getFileAuditLogs(@Request() req, @Param('fileId') fileId: string) {
    return this.auditService.getFileAuditLogs(fileId, req.user.id);
  }
}

