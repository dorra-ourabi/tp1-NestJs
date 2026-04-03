import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { CvService } from '../cv/cv.service';
import { SkillService } from '../skill/skill.service';
import { UserService } from '../user/user.service';
import { User } from '../user/entities/user.entity';
import { Skill } from '../skill/entities/skill.entity';
import {
  randLastName,
  randFirstName,
  randNumber,
  randUserName,
  randEmail,
  randPassword,
  randJobTitle,
  randSkill,
} from '@ngneat/falso';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);

  const userService = app.get(UserService);
  const skillService = app.get(SkillService);
  const cvService = app.get(CvService);

  // 1. Créer des Users
  const users: User[] = [];
  for (let i = 0; i < 5; i++) {
    const user = await userService.create({
      username: randUserName(),
      email: randEmail(),
      password: randPassword(),
    });
    users.push(user);
  }

  // 2. Créer des Skills
  const skills: Skill[] = [];
  for (let i = 0; i < 8; i++) {
    const skill = await skillService.create({
      designation: randSkill(),
    });
    skills.push(skill);
  }

  // 3. Créer des CVs liés aux users et aux skills
  for (let i = 0; i < 10; i++) {
    const randomUser = users[randNumber({ min: 0, max: users.length - 1 })];
    const randomSkills = skills.slice(
      0,
      randNumber({ min: 1, max: skills.length }),
    );

    await cvService.create({
      name: randLastName(),
      firstname: randFirstName(),
      age: randNumber({ min: 20, max: 60 }),
      cin: randNumber({ min: 10000000, max: 99999999 }).toString(),
      job: randJobTitle(),
      path: `uploads/cv_${i}.pdf`,
      userId: randomUser.id,
      skillIds: randomSkills.map((s) => s.id),
    }, 1);
  }

  await app.close();
}

bootstrap();
