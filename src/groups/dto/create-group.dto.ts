import { ApiProperty } from "@nestjs/swagger"

export class CreateGroupDto {
    @ApiProperty({
        default: "KC-2018-1"
    })
    label: string
}
