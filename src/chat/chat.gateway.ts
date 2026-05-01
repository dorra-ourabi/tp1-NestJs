import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WsException,
} from '@nestjs/websockets';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Server, Socket } from 'socket.io';
import { User } from '../user/entities/user.entity';
import { ChatService } from './chat.service';
import { UnauthorizedException } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  constructor(
    private readonly jwtService: JwtService,
    private readonly chatService: ChatService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async handleConnection(client: Socket) {
    console.log('--- new connection ---');

    // grab token from all 3 possible places
    const token =
      client.handshake.auth?.token ||
      (client.handshake.query?.token as string) ||
      this.extractBearerToken(client.handshake.headers?.authorization);

    console.log('token found:', token ? 'yes' : 'no');

    if (!token) {
      console.log('DISCONNECTED — no token');
      client.disconnect();
      return;
    }

    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: 'votre_secret_super_securise_123456',  // same secret as JwtModule
      });

      console.log('JWT payload:', payload);

      const user = await this.userRepository.findOne({
        where: { id: payload.userId },
      });

      console.log('user found:', user ? user.username : 'none');

      if (!user) {
        console.log('DISCONNECTED — user not found');
        client.disconnect();
        return;
      }

      client.data.user = {
        userId: user.id,
        username: user.username,
        role: user.role,
      };

      console.log('connection accepted:', client.data.user);

    } catch (e) {
      console.log('DISCONNECTED — error:', UnauthorizedException);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    // just log, don't call client.disconnect() here
    // it causes an infinite loop in some versions
    console.log('client disconnected:', client.id);
  }

  @SubscribeMessage('join')
  handleJoin(
    @MessageBody() payload: { userId: number },
    @ConnectedSocket() client: Socket,
  ) {
    const authUser = client.data.user;

    if (!authUser) {
      throw new WsException('Unauthorized');
    }

    if (authUser.role !== 'admin' && payload.userId !== authUser.userId) {
      throw new WsException('Forbidden');
    }

    const room = this.getRoom(payload.userId);
    client.join(room);
    client.emit('joined', { room });

    console.log(`${authUser.username} joined room ${room}`);
  }

  @SubscribeMessage('message')
  async handleMessage(
    @MessageBody() payload: { userId: number; content: string },
    @ConnectedSocket() client: Socket,
  ) {
    const authUser = client.data.user;

    if (!authUser) {
      throw new WsException('Unauthorized');
    }

    const content = payload.content?.trim();
    if (!content) {
      throw new WsException('Message content is required');
    }

    if (authUser.role !== 'admin' && payload.userId !== authUser.userId) {
      throw new WsException('Forbidden');
    }

    if (authUser.role === 'admin') {
      const targetUser = await this.userRepository.findOne({
        where: { id: payload.userId },
      });
      if (!targetUser) {
        throw new WsException('User not found');
      }
    }

    const threadUserId =
      authUser.role === 'admin' ? payload.userId : authUser.userId;

    const room = this.getRoom(threadUserId);

    const message = await this.chatService.createMessage({
      threadUserId,
      senderId: authUser.userId,
      senderRole: authUser.role,
      content,
    });

    console.log(`message in room ${room} from ${authUser.username}: ${content}`);

    this.server.to(room).emit('message', {
      id: message.id,
      userId: threadUserId,
      fromRole: message.senderRole,
      content: message.content,
      at: message.createdAt.toISOString(),
    });
  }

  private getRoom(userId: number) {
    return `chat:user:${userId}`;
  }

  private extractBearerToken(authorization?: string | string[]) {
    if (!authorization) return undefined;

    const header = Array.isArray(authorization)
      ? authorization[0]
      : authorization;

    if (!header?.startsWith('Bearer ')) return undefined;

    return header.slice('Bearer '.length).trim();
  }
}