// src/users/admin.controller.ts
import { Controller, Post, UseGuards } from '@nestjs/common';
import { SyncService } from './sync.service';
import { ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';

// @UseGuards(AuthGuard('jwt'))
// @ApiBearerAuth()
@Controller('admin')
export class AdminController {
  constructor(private readonly syncService: SyncService) {}

  @Post('sync')
  async forceSync() {
    await this.syncService.runSync();
    return { message: 'Synchronization completed successfully' };
  }
}