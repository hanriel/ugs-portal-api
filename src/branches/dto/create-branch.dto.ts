import { ApiProperty } from "@nestjs/swagger"

export class CreateBranchDto {
    @ApiProperty({
        default: "09.00.00 Информатика и вычислительная техника"
    })
    name: string
}
