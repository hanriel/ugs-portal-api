import { PartialType } from '@nestjs/mapped-types';
import { CreateSpecialityDto } from './create-specialty.dto';
import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString } from 'class-validator';

export class UpdateSpecialityDto extends PartialType(CreateSpecialityDto) {
    @ApiProperty({
        default: "09.02.01 Компьютерные системы и комплексы"
    })
    @IsString()
    label: string

    @IsNumber()
    branchId: number
}
