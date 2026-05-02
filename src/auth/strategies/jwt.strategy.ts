import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config'; // 🟢 N'oubliez pas cet import

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  // 🟢 On injecte le ConfigService ici
  constructor(private configService: ConfigService) {
    const jwtSecret = configService.get<string>('JWT_SECRET');

    if (!jwtSecret) {
      throw new Error('JWT_SECRET is not defined');
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      // 🟢 On remplace la chaîne en dur par la variable d'environnement
      secretOrKey: jwtSecret,
    });
  }

  async validate(payload: any) {
    // Petite sécurité supplémentaire très recommandée
    if (!payload) {
      throw new UnauthorizedException('Token invalide');
    }

    // Ce que vous retournez ici est injecté dans req.user
    return {
      userId: payload.userId, // Gardez bien vos propres variables de payload !
      username: payload.username,
      role: payload.role,
    };
  }
}
