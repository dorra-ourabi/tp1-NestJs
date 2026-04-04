import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: 'votre_secret_super_securise_123456', // À mettre dans .env plus tard
    });
  }

  async validate(payload: any) {
    // Ce que tu retournes ici est injecté dans req.user
    return {
      userId: payload.userId,
      username: payload.username,
      role: payload.role,
    };
  }
}
