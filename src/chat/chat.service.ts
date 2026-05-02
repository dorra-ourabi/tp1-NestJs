import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message } from './entities/message.entity';
import { UserService } from '../user/user.service';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(Message)
    private messageRepository: Repository<Message>,
    private userService: UserService,
  ) {}

  async saveMessage(userId: number, text: string): Promise<Message> {
    const user = await this.userService.findOne(userId);
    if (!user) {
      throw new Error('Utilisateur non trouvé');
    }

    const newMessage = this.messageRepository.create({
      text: text,
      user: user,
    });

    return await this.messageRepository.save(newMessage);
  }

  async getHistory(): Promise<Message[]> {
    return await this.messageRepository.find({
      order: { timestamp: 'ASC' },
      take: 50,
    });
  }

  async addReaction(messageId: string, emoji: string): Promise<Message | null> {
    const message = await this.messageRepository.findOne({
      where: { id: messageId },
    });

    if (message && message.reactions[emoji] !== undefined) {
      message.reactions[emoji]++;
      return await this.messageRepository.save(message);
    }
    return null;
  }
}
