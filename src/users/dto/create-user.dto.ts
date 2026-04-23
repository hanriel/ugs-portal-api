import { ApiProperty } from "@nestjs/swagger"

export class CreateUserDto {
    @ApiProperty()
    first_name: string
    @ApiProperty()
    last_name: String
    @ApiProperty()
    middle_name: string
    @ApiProperty()
    login: string
    @ApiProperty()
    password: string
}
