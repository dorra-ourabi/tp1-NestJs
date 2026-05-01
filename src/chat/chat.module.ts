import { Module } from '@nestjs/common';

class ChatGateway {}

@Module({
  providers: [ChatGateway],
})
export class ChatModule {}