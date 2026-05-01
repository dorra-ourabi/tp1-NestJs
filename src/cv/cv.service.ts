// src/cv/cv.service.ts
import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';       
import { Cv } from './entities/cv.entity';
import { CreateCvDto } from './dto/create-cv.dto';
import { UpdateCvDto } from './dto/update-cv.dto';
import { Skill } from '../skill/entities/skill.entity';
import { User } from '../user/entities/user.entity';
import { CvEvent } from './events/cv.events';                
@Injectable()
export class CvService {
  constructor(
    @InjectRepository(Cv)
    private readonly cvRepository: Repository<Cv>,

    @InjectRepository(Skill)
    private readonly skillRepository: Repository<Skill>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    private readonly eventEmitter: EventEmitter2,             
  ) {}

  async findAll(): Promise<Cv[]> {
    return this.cvRepository.find();
  }

  async findVisibleForUser(userId: number, role: string): Promise<Cv[]> {
    if (role === 'admin') {
      return this.cvRepository.find();
    }
    return this.cvRepository.find({
      where: { user: { id: userId } },
    });
  }

  async count(): Promise<number> {
    return this.cvRepository.count();
  }

  async findOne(id: number): Promise<Cv> {
    const cv = await this.cvRepository.findOne({ where: { id } });
    if (!cv) throw new NotFoundException(`CV #${id} introuvable`);
    return cv;
  }

  async create(createCvDto: CreateCvDto, userId: number) {
    const newCv = this.cvRepository.create({
      ...createCvDto,
      user: { id: userId } as any,
    });
    const saved = await this.cvRepository.save(newCv);

    // ← AJOUTER
    this.eventEmitter.emit(CvEvent.CREATED, {
      cvId:        saved.id,
      ownerId:     userId,
      type:        CvEvent.CREATED,
      performedBy: userId,
    });

    return saved;
  }

  async update(id: number, updateCvDto: UpdateCvDto, userId: number) {
    const cv = await this.cvRepository.findOne({ where: { id }, relations: ['user'] });
    if (!cv) throw new NotFoundException(`Le CV #${id} n'existe pas`);
    if (!cv.user || cv.user.id !== Number(userId)) {
      throw new ForbiddenException("Vous n'avez pas le droit de modifier ce CV");
    }

    const updated = await this.cvRepository.save({ ...cv, ...updateCvDto });

    // ← AJOUTER
    this.eventEmitter.emit(CvEvent.UPDATED, {
      cvId:        id,
      ownerId:     cv.user.id,
      type:        CvEvent.UPDATED,
      performedBy: userId,
    });

    return updated;
  }

  async remove(id: number): Promise<{ message: string }> {
    const cv = await this.cvRepository.findOne({ where: { id }, relations: ['user'] });
    if (!cv) throw new NotFoundException(`CV #${id} introuvable`);

    // ← AJOUTER (avant remove car après le cv n'existe plus)
    this.eventEmitter.emit(CvEvent.DELETED, {
      cvId:        id,
      ownerId:     cv.user?.id,
      type:        CvEvent.DELETED,
      performedBy: cv.user?.id ?? null,
    });

    await this.cvRepository.remove(cv);
    return { message: `CV #${id} supprimé avec succès` };
  }
}