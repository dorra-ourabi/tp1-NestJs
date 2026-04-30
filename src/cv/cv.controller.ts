import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
  Req,
  ForbiddenException,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import type { Request } from 'express';
import { CvService } from './cv.service';
import { CreateCvDto } from './dto/create-cv.dto';
import { UpdateCvDto } from './dto/update-cv.dto';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

interface AuthenticatedRequest extends Request {
  userId: number;
}
@Roles('admin')
@Controller('cvs')
export class CvController {
  constructor(private readonly cvService: CvService) {}

  @Get()
  @UseGuards(AuthGuard('jwt'))
  findAll(@Req() req: any) {
    const userId = req.user.userId;
    const role = req.user.role;
    return this.cvService.findVisibleForUser(userId, role);
  }

  @Get('admin/cv-stats')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  async getAdminStats() {
    const totalCvs = await this.cvService.count();
    return { total_cvs: totalCvs, message: 'Admin only endpoint' };
  }

  @Get(':id')
  @UseGuards(AuthGuard('jwt'))
  async findOne(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    const cv = await this.cvService.findOne(id);
    const userId = req.user.userId;
    const role = req.user.role;

    if (role !== 'admin' && cv.user.id !== userId) {
      throw new ForbiddenException('Vous ne pouvez voir que vos propres CVs');
    }

    return cv;
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(AuthGuard('jwt'))
  create(@Body() createCvDto: CreateCvDto, @Req() req: any) {
    console.log('--- TEST RÉCEPTION ---');
    console.log('User dans la requête :', req.user);

    // 1. On extrait l'ID depuis req.user (rempli par le JwtStrategy)
    const userId = req.user.userId;

    // 2. On appelle le service avec DEUX arguments distincts
    // Ne pas faire { ...createCvDto, userId } ici !
    return this.cvService.create(createCvDto, userId);
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard('jwt'))
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCvDto: UpdateCvDto,
    @Req() req: any,
  ) {
    const userId = req.user.userId;

    return await this.cvService.update(id, updateCvDto, userId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard('jwt'))
  async remove(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    const userId = req.user.userId;
    const role = req.user.role;
    const cv = await this.cvService.findOne(id);

    if (role !== 'admin' && cv.user.id !== userId) {
      throw new ForbiddenException(
        'Vous ne pouvez supprimer que vos propres CVs',
      );
    }
    return this.cvService.remove(id);
  }
}
