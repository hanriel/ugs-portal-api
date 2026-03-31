import { Module } from '@nestjs/common';
import { GroupsService } from './groups.service';
import { GroupsController } from './groups.controller';
import { GroupEntity } from './entities/group.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  controllers: [GroupsController],
  providers: [GroupsService],
  imports: [TypeOrmModule.forFeature([GroupEntity])]
})
export class GroupsModule {}
