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
  Patch,
  UseGuards
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import type { Request } from 'express';
import { CvService } from './cv.service';
import { CreateCvDto } from './dto/create-cv.dto';
import { UpdateCvDto } from './dto/update-cv.dto';

interface AuthenticatedRequest extends Request {
  userId: number;
}

@Controller('cvs')
export class CvController {
  constructor(private readonly cvService: CvService) {}

  @Get()
  findAll() {
    return this.cvService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.cvService.findOne(id);
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
    const cv = await this.cvService.findOne(id);
    if (cv.user.id !== userId) {
      throw new ForbiddenException(
        'Vous ne pouvez supprimer que vos propres CVs',
      );
    }
    return this.cvService.remove(id);
  }

}
