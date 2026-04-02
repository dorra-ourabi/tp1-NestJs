import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Cv } from './entities/cv.entity';
import { Skill } from '../skill/entities/skill.entity';
import { User } from '../user/entities/user.entity';
import { CvService } from './cv.service';
import { CvController } from './cv.controller';
import { AuthMiddleware } from '../middleware/auth.middleware';

@Module({
  imports: [TypeOrmModule.forFeature([Cv, Skill, User])],
  controllers: [CvController],
  providers: [CvService],
  exports: [CvService],
})
export class CvModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthMiddleware).forRoutes('cvs');
  }
}
