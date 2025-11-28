import { Controller, Post, Get, Body, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { FilesService } from './files.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateFileDto } from './dto/create-file.dto';

@Controller('files')
@UseGuards(JwtAuthGuard)
export class FilesController {
  constructor(private filesService: FilesService) {}

  @Post('upload')
  async upload(@Request() req, @Body() createFileDto: CreateFileDto) {
    const file = await this.filesService.create(req.user.id, createFileDto);
    return {
      id: file.id,
      filenameMasked: file.filenameMasked,
      createdAt: file.createdAt,
    };
  }

  @Get()
  async findAll(@Request() req) {
    return this.filesService.findAllByUser(req.user.id);
  }

  @Get(':id/metadata')
  async getMetadata(@Request() req, @Param('id') id: string) {
    const file = await this.filesService.findOne(id, req.user.id);
    // Return metadata only, no encrypted blob
    return {
      id: file.id,
      filenameMasked: file.filenameMasked,
      size: file.size,
      expiresAt: file.expiresAt,
      singleUse: file.singleUse,
      accessCount: file.accessCount,
      createdAt: file.createdAt,
    };
  }

  @Delete(':id')
  async remove(@Request() req, @Param('id') id: string) {
    await this.filesService.remove(id, req.user.id);
    return { success: true };
  }
}

