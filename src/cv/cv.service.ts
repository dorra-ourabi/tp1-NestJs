
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Cv } from './entities/cv.entity';
import { CreateCvDto } from './dto/create-cv.dto';
import { UpdateCvDto } from './dto/update-cv.dto';
import { Skill } from '../skill/entities/skill.entity';
import { User } from '../user/entities/user.entity';

@Injectable()
export class CvService {
  constructor(
    @InjectRepository(Cv)
    private readonly cvRepository: Repository<Cv>,

    @InjectRepository(Skill)
    private readonly skillRepository: Repository<Skill>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async findAll(): Promise<Cv[]> {
    return this.cvRepository.find(); 
  }

  async findOne(id: number): Promise<Cv> {
    const cv = await this.cvRepository.findOne({
      where: { id },
    }); 

    if (!cv) {
      throw new NotFoundException(`CV #${id} introuvable`);
    }

    return cv;
  }

  async create(createCvDto: CreateCvDto): Promise<Cv> {
    const { skillIds, userId, ...cvData } = createCvDto;

    const user = await this.userRepository.findOne({
      where: { id: userId },
    });
    if (!user) {
      throw new NotFoundException(`User #${userId} introuvable`);
    }

    let skills: Skill[] = [];
    if (skillIds && skillIds.length > 0) {
      skills = await this.skillRepository.findBy({ id: In(skillIds) });
    }

    const cv = this.cvRepository.create({
      ...cvData,
      user,
      skills,
    });

    return this.cvRepository.save(cv);
  }

  async update(id: number, updateCvDto: UpdateCvDto): Promise<Cv> {
    const cv = await this.findOne(id);
    const { skillIds, userId, ...cvData } = updateCvDto;

    if (userId) {
      const user = await this.userRepository.findOne({
        where: { id: userId },
      });
      if (!user) {
        throw new NotFoundException(`User #${userId} introuvable`);
      }
      cv.user = user;
    }

    if (skillIds !== undefined) { 
      cv.skills = await this.skillRepository.findBy({ id: In(skillIds) });
    }

    Object.assign(cv, cvData);

    return this.cvRepository.save(cv);
  }

  async remove(id: number): Promise<{ message: string }> {
    const cv = await this.findOne(id);
    await this.cvRepository.remove(cv);
    return { message: `CV #${id} supprimé avec succès` };
  }
}