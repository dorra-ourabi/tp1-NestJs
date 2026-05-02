import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';

@Injectable()
export class WsJwtGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const client: Socket = context.switchToWs().getClient<Socket>();

      const authHeader = client.handshake.headers.authorization;
      const token =
        client.handshake.auth.token || (authHeader && authHeader.split(' ')[1]);

      if (!token) {
        throw new WsException('Token JWT manquant');
      }

      const payload = this.jwtService.verify(token);

      client.data.user = payload;

      return true;
    } catch (err) {
      throw new WsException('Non autorisé : Token invalide');
    }
  }
}
