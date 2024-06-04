import { ApiProperty } from "@nestjs/swagger"
import { RoleEntity } from "src/roles/entities/role.entity"

export class CreateUserDto {
    @ApiProperty()
    first_name: string
    @ApiProperty()
    last_name: String
    @ApiProperty()
    middle_name: string
    @ApiProperty()
    role: RoleEntity
    @ApiProperty()
    login: string
    @ApiProperty()
    password: string
}
