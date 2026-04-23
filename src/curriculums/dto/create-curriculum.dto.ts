import { IsString, IsInt, IsArray, ValidateNested, IsOptional, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';

export class CurriculumDisciplineDto {
  @IsInt()
  disciplineId: number;

  @IsInt()
  semester: number;

  @IsInt()
  lectureHours: number;

  @IsInt()
  practiceHours: number;

  @IsInt()
  labHours: number;

  @IsInt()
  selfStudyHours: number;

  @IsInt()
  controlHours: number;

  @IsOptional()
  @IsString()
  attestation?: string;

  @IsOptional()
  @IsBoolean()
  hasCourseWork?: boolean;

  @IsOptional()
  @IsBoolean()
  hasCourseProject?: boolean;

  @IsOptional()
  @IsInt()
  courseWorkSemester?: number;
}

export class CreateCurriculumDto {
  @IsString()
  name: string;

  @IsInt()
  specialtyId: number;

  @IsInt()
  academicYearId: number;

  @IsInt()
  yearOfAdmission: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CurriculumDisciplineDto)
  disciplines: CurriculumDisciplineDto[];
}