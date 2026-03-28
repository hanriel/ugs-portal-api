import { Module } from '@nestjs/common';
import { BranchesService } from './branches.service';
import { BranchesController } from './branches.controller';
import { BranchEntity } from './entities/branches.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  controllers: [BranchesController],
  providers: [BranchesService],
  imports: [TypeOrmModule.forFeature([BranchEntity])]
})
export class BranchesModule {}
