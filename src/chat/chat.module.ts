import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { User } from '../user/entities/user.entity';
import { ChatGateway } from './chat.gateway';
import { ChatService } from './chat.service';
import { ChatMessage } from './entities/chat-message.entity';


@Module({
  imports: [TypeOrmModule.forFeature([ChatMessage, User]), AuthModule],
  providers: [ChatGateway, ChatService],
})
export class ChatModule {}