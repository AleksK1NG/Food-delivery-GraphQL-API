import { Controller, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import * as AWS from 'aws-sdk';
import { v4 as uuidV4 } from 'uuid';
import { ConfigService } from '@nestjs/config';
import { FileInterceptor } from '@nestjs/platform-express';

const BUCKET_NAME = 'alex123';

@Controller('api/v1/uploads')
export class AwsController {
  constructor(private readonly configService: ConfigService) {}

  @Post('')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file) {
    AWS.config.update({
      credentials: {
        accessKeyId: this.configService.get('AWS_KEY'),
        secretAccessKey: this.configService.get('AWS_SECRET'),
      },
    });
    const objectName = `${Date.now() + file.originalname}-${uuidV4()}`;
    await new AWS.S3()
      .putObject({
        Body: file.buffer,
        Bucket: BUCKET_NAME,
        Key: objectName,
        ACL: 'public-read',
      })
      .promise();
    const url = `https://${BUCKET_NAME}.s3.amazonaws.com/${objectName}`;
    return { url };
  }
}
