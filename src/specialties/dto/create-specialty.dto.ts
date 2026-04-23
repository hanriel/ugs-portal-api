import { ApiProperty } from "@nestjs/swagger"
import { IsNotEmpty, IsNumber, IsString } from "class-validator"

export class CreateSpecialityDto {
    @ApiProperty({
        default: "09.02.01 Компьютерные системы и комплексы"
    })
    @IsString()
    @IsNotEmpty()
    name: string

    @IsNumber()
    branchId: number

}
