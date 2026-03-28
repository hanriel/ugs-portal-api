import { PartialType } from '@nestjs/mapped-types';
import { CreateBranchDto } from './create-branch.dto';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateBranchDto extends PartialType(CreateBranchDto) {
    @ApiProperty({
        default: "09.00.00 Информатика и вычислительная техника"
    })
    label: string
}
