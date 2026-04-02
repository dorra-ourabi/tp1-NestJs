import { Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';

interface DecodedToken {
  userId: number;
}

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers['auth-user'] as string;

    if (!authHeader) {
      throw new UnauthorizedException('Token manquant');
    }

    try {
      const decoded = jwt.decode(authHeader) as DecodedToken;
      if (!decoded || !decoded.userId) {
        throw new UnauthorizedException('Token invalide ou userId manquant');
      }
      (req as any).userId = decoded.userId;
      next();
    } catch {
      throw new UnauthorizedException('Token invalide');
    }
  }
}
