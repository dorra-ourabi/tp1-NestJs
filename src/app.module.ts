import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CvModule } from './cv/cv.module';
import { UserModule } from './user/user.module';
import { SkillModule } from './skill/skill.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { CvLogModule } from './cv-log/cv-log.module';
<<<<<<< HEAD
import { ChatModule } from './chat/chat.module';
=======
import { WebhookModule } from './webhook/webhook.module';

>>>>>>> origin/feature/webhook
@Module({
  imports: [
    UserModule,
    EventEmitterModule.forRoot(),
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'mysql',
        host: config.get<string>('DB_HOST'),
        port: config.get<number>('DB_PORT') || 3306,
        username: config.get<string>('DB_USERNAME'),
        password: config.get<string>('DB_PASSWORD'),
        database: config.get<string>('DB_NAME'),
        autoLoadEntities: true,
        synchronize: config.get<string>('NODE_ENV') !== 'production',
        connectorPackage: 'mysql2',
        logging: true,
      }),
    }),

    CvModule,

    SkillModule,

    AuthModule,
    CvLogModule,
<<<<<<< HEAD
    ChatModule,
=======

    WebhookModule,
>>>>>>> origin/feature/webhook
  ],
})
export class AppModule {}
