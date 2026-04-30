import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { WebhookService } from './webhook.service';

@Module({
  imports: [HttpModule],
  providers: [WebhookService],
})
export class WebhookModule {}
