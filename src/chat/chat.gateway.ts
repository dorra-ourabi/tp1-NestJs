import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { constrainedMemory } from 'process';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server ;

  handleConnection(client: Socket) {
    console.log('Client connected:', client.id);
  }

  handleDisconnect(client: Socket) {
    console.log('Client disconnected:', client.id);
  }

  @SubscribeMessage('join')
  handleJoin(
    @MessageBody() payload: { userId: number; role: 'user' | 'admin' },
    @ConnectedSocket() client: Socket,
  ) {
    const room = this.getRoom(payload.userId);
    client.join(room);
    client.emit('joined', { room });
  }

  @SubscribeMessage('message')
  handleMessage(
    @MessageBody()
    payload: {
      userId: number;
      fromRole: 'user' | 'admin';
      content: string;
    },
  ) {
    const room = this.getRoom(payload.userId);

    // emit to both user + recruiter in same room
    this.server.to(room).emit('message', {
      userId: payload.userId,
      fromRole: payload.fromRole,
      content: payload.content,
      at: new Date().toISOString(),
    });
  }

  private getRoom(userId: number) {
    return `chat:user:${userId}`;
  }
}