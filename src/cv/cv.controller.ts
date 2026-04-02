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
} from '@nestjs/common';
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
  create(@Body() createCvDto: CreateCvDto, @Req() req: Request) {
    const userId = (req as AuthenticatedRequest).userId;
    return this.cvService.create({ ...createCvDto, userId });
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCvDto: UpdateCvDto,
    @Req() req: Request,
  ) {
    const userId = (req as AuthenticatedRequest).userId;
    const cv = await this.cvService.findOne(id);
    if (cv.user.id !== userId) {
      throw new ForbiddenException(
        'Vous ne pouvez modifier que vos propres CVs',
      );
    }
    return this.cvService.update(id, updateCvDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async remove(@Param('id', ParseIntPipe) id: number, @Req() req: Request) {
    const userId = (req as AuthenticatedRequest).userId;
    const cv = await this.cvService.findOne(id);
    if (cv.user.id !== userId) {
      throw new ForbiddenException(
        'Vous ne pouvez supprimer que vos propres CVs',
      );
    }
    return this.cvService.remove(id);
  }
}
