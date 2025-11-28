import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as AWS from 'aws-sdk';

@Injectable()
export class S3Service implements OnModuleInit {
  private readonly logger = new Logger(S3Service.name);
  private s3: AWS.S3;
  private bucket: string;

  constructor(private configService: ConfigService) {
    const endpoint = this.configService.get<string>('S3_ENDPOINT');
    const accessKeyId = this.configService.get<string>('S3_ACCESS_KEY');
    const secretAccessKey = this.configService.get<string>('S3_SECRET_KEY');
    const region = this.configService.get<string>('S3_REGION') || 'us-east-1';

    this.bucket = this.configService.get<string>('S3_BUCKET') || 'envvault';

    this.s3 = new AWS.S3({
      endpoint,
      accessKeyId,
      secretAccessKey,
      region,
      s3ForcePathStyle: true, // Required for MinIO
      signatureVersion: 'v4',
    });
  }

  async onModuleInit() {
    await this.ensureBucketExists();
  }

  private async ensureBucketExists(): Promise<void> {
    try {
      await this.s3.headBucket({ Bucket: this.bucket }).promise();
      this.logger.log(`Bucket ${this.bucket} exists`);
    } catch (error) {
      if (error.statusCode === 404) {
        this.logger.log(`Creating bucket ${this.bucket}...`);
        await this.s3
          .createBucket({
            Bucket: this.bucket,
          })
          .promise();
        this.logger.log(`Bucket ${this.bucket} created`);
      } else {
        this.logger.error(`Error checking bucket: ${error.message}`);
        throw error;
      }
    }
  }

  async upload(key: string, body: Buffer): Promise<string> {
    try {
      const result = await this.s3
        .upload({
          Bucket: this.bucket,
          Key: key,
          Body: body,
          ContentType: 'application/octet-stream',
        })
        .promise();
      return result.Location;
    } catch (error) {
      this.logger.error(`Error uploading to S3: ${error.message}`);
      throw error;
    }
  }

  async download(key: string): Promise<Buffer> {
    try {
      const result = await this.s3
        .getObject({
          Bucket: this.bucket,
          Key: key,
        })
        .promise();
      return result.Body as Buffer;
    } catch (error) {
      this.logger.error(`Error downloading from S3: ${error.message}`);
      throw error;
    }
  }

  async delete(key: string): Promise<void> {
    try {
      await this.s3
        .deleteObject({
          Bucket: this.bucket,
          Key: key,
        })
        .promise();
    } catch (error) {
      this.logger.error(`Error deleting from S3: ${error.message}`);
      throw error;
    }
  }
}

