import {
  Controller,
  Get,
  Req,
  Sse,
  UseGuards,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { CvLogService } from './cv-log.service';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('cv-logs')
@UseGuards(AuthGuard('jwt'))
export class CvLogController {
  constructor(private readonly cvLogService: CvLogService) {}

  // GET /cv-logs/stream  → flux SSE temps réel
  @Sse('stream')
  stream(@Req() req): Observable<MessageEvent> {
    const userId = req.user.userId;  // ← userId et non id
    const role = req.user.ro

    const subject = this.cvLogService.subscribe(userId, role);

    return subject.pipe(
      map((log) => ({ data: log } as MessageEvent)),
    );
  }

  // GET /cv-logs  → historique complet (admin seulement)
  @Get()
  @Roles('admin')
  @UseGuards(RolesGuard)
  findAll() {
    return this.cvLogService.findAll();
  }

  // GET /cv-logs/mine  → historique du user connecté
  @Get('mine')
  findMine(@Req() req) {
    return this.cvLogService.findByOwner(req.user.userId);
  }
}