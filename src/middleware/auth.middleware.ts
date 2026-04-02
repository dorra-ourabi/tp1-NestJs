import {
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';

interface DecodedToken {
  userId: number;
}

interface AuthenticatedRequest extends Request {
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
      const JWT_SECRET='votre_secret_super_securise_123456';
      const decoded = jwt.verify(authHeader, JWT_SECRET) as DecodedToken;
      if (!decoded || !decoded.userId) {
        throw new UnauthorizedException('Token invalide ou userId manquant');
      }
      (req as AuthenticatedRequest).userId = decoded.userId;
      next();
    } catch {
      throw new UnauthorizedException('Token invalide');
    }
  }
}
