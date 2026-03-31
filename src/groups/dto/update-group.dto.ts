import { PartialType } from '@nestjs/mapped-types';
import { CreateGroupDto } from './create-group.dto';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateGroupDto extends PartialType(CreateGroupDto) {
    @ApiProperty({
        default: "KC-2018-1"
    })
    label: string
}
