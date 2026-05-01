import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CvLog } from './cv-log.entity';
import { CvLogService } from './cv-log.service';
import { CvLogController } from './cv-log.controller';

@Module({
  imports: [TypeOrmModule.forFeature([CvLog])],
  providers: [CvLogService],
  controllers: [CvLogController],
})
export class CvLogModule {}