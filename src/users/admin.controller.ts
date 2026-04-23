// src/users/admin.controller.ts
import { Controller, Post } from '@nestjs/common';
import { SyncService } from './sync.service';

@Controller('admin')
export class AdminController {
  constructor(private readonly syncService: SyncService) {}

  @Post('sync')
  async forceSync() {
    await this.syncService.runSync();
    return { message: 'Synchronization completed successfully' };
  }
}