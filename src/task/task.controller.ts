import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  UseGuards,
  Query,
} from '@nestjs/common';
import { TaskService } from './task.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import User from 'src/auth/decorators/user-decorator';
import { AssignTaskDto } from './dto/assign-task-dto';
import { TaskStatusDto } from './dto/task-status-dto';
import {
  WorkspaceAdminGuard,
  WorkspaceGuard,
} from 'src/auth/guards/workspace-guard';
import { QueryDto } from 'utils/query-prepare';
import { LinkTaskDto } from './dto/link-task-dto';

@UseGuards(WorkspaceGuard)
@Controller('workspaces/:workspaceId/tasks')
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  @Post()
  create(
    @Body() createTaskDto: CreateTaskDto,
    @Param('workspaceId', ParseIntPipe) workspaceId: number,
    @User() user,
  ) {
    return this.taskService.create({ ...createTaskDto, workspaceId }, user);
  }

  @Get()
  findAll(
    @Param('workspaceId', ParseIntPipe) workspaceId: number,
    @Query() queryObj?: QueryDto,
  ) {
    return this.taskService.findAll({ ...queryObj, workspaceId });
  }

  @Get(':taskId')
  findOne(@Param('taskId') taskId: string) {
    return this.taskService.findOne(+taskId);
  }

  @Patch(':taskId')
  async update(
    @Param('taskId') taskId: string,
    @Body() updateTaskDto: UpdateTaskDto,
    @User() user,
  ) {
    const result = await this.taskService.update(+taskId, updateTaskDto, user);
    return {
      message: result ? 'Task updated successfully' : 'Task not found',
      status: result ? 'success' : 'fail',
    };
  }

  @Delete(':taskId')
  async remove(@Param('taskId') taskId: string, @User() user) {
    const result = await this.taskService.remove(+taskId, user);
    return {
      message: result ? 'Task deleted successfully' : 'Task not found',
      status: result ? 'success' : 'fail',
    };
  }

  @UseGuards(WorkspaceAdminGuard)
  @Patch(':taskId/assign')
  async assignTaskToMember(
    @Body() assignTaskDto: AssignTaskDto,
    @Param('taskId', ParseIntPipe) taskId: number,
    @Param('workspaceId', ParseIntPipe) workspaceId: number,
  ) {
    const result = await this.taskService.assignTaskToMember(
      assignTaskDto.assigneeId,
      taskId,
      workspaceId,
    );
    return {
      message: result ? 'Task assigned successfully' : 'Task not found',
      status: result ? 'success' : 'fail',
    };
  }

  @Patch(':taskId/status')
  async changeStatus(
    @Param('taskId') taskId: string,
    @Body() taskStatusDto: TaskStatusDto,
    @User() user,
  ) {
    const result = await this.taskService.changeTaskStatus(
      taskStatusDto,
      +taskId,
      user,
    );
    return {
      message: result ? 'Task status updated successfully' : 'Task not found',
      status: result ? 'success' : 'fail',
    };
  }

  @Post('/dependencies')
  linkTasks(
    @Body() linkTaskDto: LinkTaskDto,
    @User() user,
    @Param('workspaceId', ParseIntPipe) workspaceId: number,
  ) {
    return this.taskService.createTaskLink(linkTaskDto, user, workspaceId);
  }

  @Patch('/dependencies/:id')
  async updateTaskLink(
    @Param('id', ParseIntPipe) id: number,
    @Body() linkTaskDto: LinkTaskDto,
    @User() user,
  ) {
    const result = await this.taskService.updateTaskLink(id, linkTaskDto, user);
    return {
      message: result ? 'linke updated successfully' : 'Link not found',
      status: result ? 'success' : 'fail',
    };
  }

  @Delete('/dependencies/:id')
  async removeTaskLink(@Param('id', ParseIntPipe) id: number, @User() user) {
    const result = await this.taskService.removeTaskLink(id, user);
    return {
      message: result ? 'Link deleted successfully' : 'Link not found',
      status: result ? 'success' : 'fail',
    };
  }
}
