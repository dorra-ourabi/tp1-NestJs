import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Skill } from './entities/skill.entity';
import { CreateSkillDto } from './dto/create-skill.dto';
import { UpdateSkillDto } from './dto/update-skill.dto';

@Injectable()
export class SkillService {
  constructor(
    @InjectRepository(Skill)
    private readonly skillRepository: Repository<Skill>,
  ) {}

  async findAll(): Promise<Skill[]> {
    return this.skillRepository.find({
      relations: ['cvs'],
    });
  }

  async findOne(id: number): Promise<Skill> {
    const skill = await this.skillRepository.findOne({
      where: { id },
      relations: ['cvs'],
    });

    if (!skill) {
      throw new NotFoundException(`Skill #${id} introuvable`);
    }

    return skill;
  }

  async create(createSkillDto: CreateSkillDto): Promise<Skill> {
    return this.skillRepository.save(createSkillDto);
  }

  async update(id: number, updateSkillDto: UpdateSkillDto): Promise<Skill> {
    const skill = await this.findOne(id);
    Object.assign(skill, updateSkillDto);
    return this.skillRepository.save(skill);
  }

  async remove(id: number): Promise<{ message: string }> {
    const skill = await this.findOne(id);
    await this.skillRepository.remove(skill);
    return { message: `Skill #${id} supprimé avec succès` };
  }
}
