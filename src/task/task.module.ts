import { Module } from '@nestjs/common';
import { TaskService } from './task.service';
import { TaskController } from './controllers/task.controller';
import {
  WorkspaceAdminGuard,
  WorkspaceGuard,
} from 'src/auth/guards/workspace-guard';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Task } from './entities/task.entity';
import { TaskDependency } from './entities/task-dependency.entity';
import { WorkspaceModule } from 'src/workspace/workspace.module';
import { TaskDependecyController } from './controllers/task-dependecy.controller';

@Module({
  imports: [MikroOrmModule.forFeature([Task, TaskDependency]), WorkspaceModule],
  controllers: [TaskController, TaskDependecyController],
  providers: [TaskService, WorkspaceGuard, WorkspaceAdminGuard],
})
export class TaskModule {}
