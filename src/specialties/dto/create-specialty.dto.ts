import { ApiProperty } from "@nestjs/swagger"

export class CreateSpecialityDto {
    @ApiProperty({
        default: "09.02.01 Компьютерные системы и комплексы"
    })
    name: string
}
