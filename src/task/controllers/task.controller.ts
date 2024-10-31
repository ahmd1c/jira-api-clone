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
  NotFoundException,
} from '@nestjs/common';
import { TaskService } from '../task.service';
import { CreateTaskDto } from '../dto/create-task.dto';
import { UpdateTaskDto } from '../dto/update-task.dto';
import User from 'src/auth/decorators/user-decorator';
import { AssignTaskDto } from '../dto/assign-task-dto';
import { TaskStatusDto } from '../dto/task-status-dto';
import {
  WorkspaceAdminGuard,
  WorkspaceGuard,
} from 'src/auth/guards/workspace-guard';
import { QueryDto } from 'utils/query-prepare';

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
  async findAll(
    @Param('workspaceId', ParseIntPipe) workspaceId: number,
    @Query() queryObj?: QueryDto,
  ) {
    const tasks = await this.taskService.findAll({ ...queryObj, workspaceId });
    if (!tasks.data?.length) throw new NotFoundException('Tasks not found');
    return tasks;
  }

  @Get(':taskId')
  async findOne(@Param('taskId' , ParseIntPipe) taskId: number) {
    const task = await this.taskService.findOne(taskId);
    if (!task) throw new NotFoundException('Task not found');
    return task;
  }

  @Patch(':taskId')
  async update(
    @Param('taskId' , ParseIntPipe) taskId: number,
    @Body() updateTaskDto: UpdateTaskDto,
    @User() user,
  ) {
    const result = await this.taskService.update(taskId, updateTaskDto, user);
    return {
      message: result ? 'Task updated successfully' : 'Task not found',
      status: result ? 'success' : 'fail',
    };
  }

  @Delete(':taskId')
  async remove(@Param('taskId' , ParseIntPipe) taskId: number, @User() user) {
    const result = await this.taskService.remove(taskId, user);
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
    @Param('taskId' , ParseIntPipe) taskId: number,
    @Body() taskStatusDto: TaskStatusDto,
    @User() user,
  ) {
    const result = await this.taskService.changeTaskStatus(
      taskStatusDto,
      taskId,
      user,
    );
    return {
      message: result ? 'Task status updated successfully' : 'Task not found',
      status: result ? 'success' : 'fail',
    };
  }
}
