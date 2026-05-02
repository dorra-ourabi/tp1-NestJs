import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  WebSocketServer,
  ConnectedSocket,
  OnGatewayConnection,
} from '@nestjs/websockets';
import { WsJwtGuard } from './ws-jwt.guard';
import { UseGuards } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';
import { JwtService } from '@nestjs/jwt';

@WebSocketGateway({ cors: { origin: '*' } })
export class ChatGateway implements OnGatewayConnection {
  @WebSocketServer()
  server!: Server;

  constructor(
    private readonly chatService: ChatService,
    private readonly jwtService: JwtService,
  ) {}
  async handleConnection(client: Socket) {
    try {
      const authHeader = client.handshake.headers.authorization;
      const token =
        client.handshake.auth.token || (authHeader && authHeader.split(' ')[1]);

      if (!token) {
        throw new Error('Token manquant');
      }
      const payload = this.jwtService.verify(token);

      console.log(`Client connecté et authentifié : ${client.id}`);
      const history = await this.chatService.getHistory();
      client.emit('chatHistory', history);
    } catch (error) {
      console.log(
        `Tentative de connexion refusée : ${error instanceof Error ? error.message : String(error)}`,
      );
      client.disconnect();
    }
  }

  @SubscribeMessage('requestHistory')
  async handleRequestHistory(@ConnectedSocket() client: Socket): Promise<void> {
    const history = await this.chatService.getHistory();
    client.emit('chatHistory', history);
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('sendMessage')
  async handleMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { text: string },
  ): Promise<void> {
    try {
      const userId = client.data.user.id;

      const savedMessage = await this.chatService.saveMessage(
        userId,
        data.text,
      );
      this.server.emit('newMessage', savedMessage);
    } catch (error) {
      if (error instanceof Error) {
        console.error(error.message);
      } else {
        console.error(error);
      }
    }
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('addReaction')
  async handleReaction(
    @MessageBody() data: { messageId: string; emoji: string },
  ): Promise<void> {
    const updatedMessage = await this.chatService.addReaction(
      data.messageId,
      data.emoji,
    );
    if (updatedMessage) {
      this.server.emit('messageUpdated', updatedMessage);
    }
  }
}
