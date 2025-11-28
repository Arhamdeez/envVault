import { IsString, IsOptional, IsBoolean, IsDateString } from 'class-validator';

export class CreateFileDto {
  @IsString()
  encryptedBlob: string; // base64

  @IsString()
  iv: string; // base64

  @IsString()
  filenameMasked: string;

  @IsOptional()
  @IsDateString()
  expiresAt?: string;

  @IsOptional()
  @IsBoolean()
  singleUse?: boolean;
}

