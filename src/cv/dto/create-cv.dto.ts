import { IsString, IsNumber, IsOptional, IsArray } from 'class-validator';

export class CreateCvDto {
  @IsString()
  name: string;

  @IsString()
  firstname: string;

  @IsNumber()
  age: number;

  @IsString()
  cin: string;

  @IsString()
  job: string;

  @IsOptional()
  @IsString()
  path?: string;

  @IsNumber()
  userId: number;

  @IsOptional()
  @IsArray()
  skillIds?: number[];
}