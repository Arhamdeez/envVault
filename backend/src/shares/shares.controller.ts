import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  UseGuards,
  Request,
  Ip,
  UseInterceptors,
  ClassSerializerInterceptor,
} from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import { SharesService } from './shares.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateShareDto } from './dto/create-share.dto';

@Controller('shares')
export class SharesController {
  constructor(private sharesService: SharesService) {}

  @Post('create')
  @UseGuards(JwtAuthGuard)
  async create(@Request() req, @Body() createShareDto: CreateShareDto) {
    return this.sharesService.create(req.user.id, createShareDto);
  }

  @Get(':token/download')
  @UseGuards(ThrottlerGuard) // Rate limit share downloads
  @UseInterceptors(ClassSerializerInterceptor)
  async download(@Param('token') token: string, @Ip() ip: string) {
    return this.sharesService.downloadByToken(token, ip);
  }

  @Post(':id/revoke')
  @UseGuards(JwtAuthGuard)
  async revoke(@Request() req, @Param('id') id: string) {
    return this.sharesService.revoke(id, req.user.id);
  }

  @Get('file/:fileId')
  @UseGuards(JwtAuthGuard)
  async findAllByFile(@Request() req, @Param('fileId') fileId: string) {
    return this.sharesService.findAllByFile(fileId, req.user.id);
  }
}

