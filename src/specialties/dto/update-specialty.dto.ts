import { PartialType } from '@nestjs/mapped-types';
import { CreateSpecialityDto } from './create-specialty.dto';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateBranchDto extends PartialType(CreateSpecialityDto) {
    @ApiProperty({
        default: "09.02.01 Компьютерные системы и комплексы"
    })
    label: string
}
