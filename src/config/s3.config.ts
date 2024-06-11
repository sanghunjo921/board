import { registerAs } from '@nestjs/config';

export default registerAs('s3', () => ({
  region: process.env.AWS_REGION,
  access_key: process.env.AWS_S3_ACCESS_KEY,
  secret_key: process.env.AWS_S3_SECRET_ACCESS_KEY,
  bucket_name: process.env.AWS_S3_BUCKET_NAME,
}));
