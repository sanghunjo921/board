import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import dotenv from 'dotenv';

@Injectable()
export class S3Service {
  s3Client: S3Client;

  constructor(private configService: ConfigService) {
    this.s3Client = new S3Client({
      region: configService.get('s3.region'),
      credentials: {
        accessKeyId: configService.get('s3.access_key'),
        secretAccessKey: configService.get('s3.secret_key'),
      },
    });
  }

  async uploadImageToS3(
    fileName: string,
    file: Express.Multer.File,
    ext: string,
  ) {
    const command = new PutObjectCommand({
      Bucket: this.configService.get('s3.bucket_name'),
      Key: fileName,
      Body: file.buffer,
      ACL: 'public-read',
      ContentType: `image/${ext}`,
    });

    await this.s3Client.send(command);
    return `https://${this.configService.get('s3.bucket_name')}.s3.${this.configService.get('s3.region')}.amazonaws.com/${fileName}`;
  }
}
