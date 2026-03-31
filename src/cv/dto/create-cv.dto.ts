import { IsString, IsNumber, IsOptional, IsArray, IsInt } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateCvDto {
  @IsString()
  name: string;

  @IsString()
  firstname: string;

  @IsInt()
  @Type(() => Number)
  age: number;

  @IsString()
  cin: string;

  @IsString()
  job: string;

  @IsOptional()
  @IsString()
  path?: string;

  @IsInt()
  @Type(() => Number)
  userId: number;

  @IsOptional()
  @IsArray()
  @IsInt({ each: true })   
  @Type(() => Number)
  skillIds?: number[];
}