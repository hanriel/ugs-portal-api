import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { SpecialtiesService } from './specialties.service';
import { CreateSpecialityDto } from './dto/create-specialty.dto';

@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
@Controller('specialties')
@ApiTags('specialties')
export class SpecialtiesController {
    constructor(private readonly specialtiesService: SpecialtiesService) {}

      @Get()
      findAll() {
        return this.specialtiesService.findAll();
      }

      @Post()
      create(@Body() createSpecialityDto: CreateSpecialityDto) {
        return this.specialtiesService.create(createSpecialityDto);
      }
    
      @Get(':id')
      findOne(@Param('id') id: string) {
        return this.specialtiesService.findOne(+id);
      }
    
      @Patch(':id')
      update(@Param('id') id: string, @Body() updateSpecialityDto: CreateSpecialityDto) {
        return this.specialtiesService.update(+id, updateSpecialityDto);
      }
    
      @Delete(':id')
      remove(@Param('id') id: string) {
        return this.specialtiesService.remove(+id);
      }
}
