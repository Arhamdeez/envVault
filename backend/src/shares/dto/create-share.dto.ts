import { IsString, IsOptional, IsInt, IsDateString, Min } from 'class-validator';

export class CreateShareDto {
  @IsString()
  fileId: string;

  @IsOptional()
  @IsDateString()
  expiresAt?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  usageLimit?: number;
}

