import {
  UseGuards,
  Controller,
  Post,
  Body,
  Param,
  ParseIntPipe,
  Get,
  Patch,
  Delete,
} from '@nestjs/common';
import { WorkspaceGuard } from 'src/auth/guards/workspace-guard';
import { LinkTaskDto, UpdateLinkTaskDto } from '../dto/link-task-dto';
import { TaskService } from '../task.service';
import User from 'src/auth/decorators/user-decorator';

@UseGuards(WorkspaceGuard)
@Controller('workspaces/:workspaceId/dependencies')
export class TaskDependecyController {
  constructor(private readonly taskService: TaskService) {}

  @Post()
  linkTasks(
    @Body() linkTaskDto: LinkTaskDto,
    @User() user,
    @Param('workspaceId', ParseIntPipe) workspaceId: number,
  ) {
    return this.taskService.createTaskLink(linkTaskDto, user, workspaceId);
  }

  @Get()
  getAllDependenciesInWorkspace(
    @Param('workspaceId', ParseIntPipe) workspaceId: number,
  ) {
    return this.taskService.getAllTaskLinksInWorkspace(workspaceId);
  }

  @Get(':id')
  getDependency(@Param('id', ParseIntPipe) id: number) {
    return this.taskService.getLinking(id);
  }

  @Patch(':id')
  async updateTaskLink(
    @Param('id', ParseIntPipe) id: number,
    @Body() linkTaskDto: UpdateLinkTaskDto,
    @User() user,
  ) {
    const result = await this.taskService.updateTaskLink(id, linkTaskDto, user);
    return {
      message: result ? 'linke updated successfully' : 'Link not found',
      status: result ? 'success' : 'fail',
    };
  }

  @Delete(':id')
  async removeTaskLink(@Param('id', ParseIntPipe) id: number, @User() user) {
    const result = await this.taskService.removeTaskLink(id, user);
    return {
      message: result ? 'Link deleted successfully' : 'Link not found',
      status: result ? 'success' : 'fail',
    };
  }
}
