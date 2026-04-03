import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
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

  // cvs.service.ts

  async create(createCvDto: CreateCvDto, userId: number) {
      // 1. On prépare l'objet CV en fusionnant les données du formulaire (DTO)
      // et l'objet utilisateur (créé à partir de l'ID extrait du Token)
      const newCv = this.cvRepository.create({
        ...createCvDto,
        user: { id: userId } as any // On dit à TypeORM : "L'auteur est l'user avec cet ID"
      });

      // 2. On sauvegarde dans MySQL
      return await this.cvRepository.save(newCv);
    }

    

  // Dans cvs.service.ts
  async update(id: number, updateCvDto: UpdateCvDto, userId: number) { // Ajoute le 3ème argument
    const cv = await this.cvRepository.findOne({ where: { id }, relations: ['user'] });
  
    if (!cv) throw new NotFoundException(`Le CV #${id} n'existe pas`);

    // Vérification de sécurité : est-ce que ce CV appartient à l'user connecté ?
    if (cv.user.id !== Number(userId)) {
      throw new ForbiddenException("Vous n'avez pas le droit de modifier ce CV");
    }

    return await this.cvRepository.save({ ...cv, ...updateCvDto });
  }

  async remove(id: number): Promise<{ message: string }> {
    const cv = await this.findOne(id);
    await this.cvRepository.remove(cv);
    return { message: `CV #${id} supprimé avec succès` };
  }
}
