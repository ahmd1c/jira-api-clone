import { QueryDto } from 'utils/query-prepare';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { EntityRepository } from '@mikro-orm/postgresql';
import { PRIORITY, Task, TASK_STATUS, TASK_TYPE } from './entities/task.entity';
import {
  TASK_DEPENDENCY_TYPE,
  TaskDependency,
} from './entities/task-dependency.entity';
import { UserRole } from 'src/workspace/entities/user-workspace.entity';
import { RequestUser } from 'types';
import { applyCustomQuery } from 'utils/apply-custom-query';
import { InjectRepository } from '@mikro-orm/nestjs';
import { WorkspaceService } from 'src/workspace/workspace.service';
import { LinkTaskDto } from './dto/link-task-dto';

@Injectable()
export class TaskService {
  constructor(
    @InjectRepository(Task)
    private readonly taskRepo: EntityRepository<Task>,
    @InjectRepository(TaskDependency)
    private readonly taskDependencyRepo: EntityRepository<TaskDependency>,
    private readonly workspaceService: WorkspaceService,
  ) {}

  async create(
    createTaskDto: CreateTaskDto & { workspaceId: number },
    user: RequestUser,
  ) {
    const { workspaceId, assigneeId, parentId } = createTaskDto;

    if (parentId) {
      const parent = await this.taskRepo.findOne({
        id: parentId,
        workspace: workspaceId,
      });
      if (!parent) throw new NotFoundException('Parent task not found');
      if (parent.status === TASK_STATUS.DONE) {
        throw new BadRequestException('Parent task is already done');
      }
      if (parent.type === TASK_TYPE.SUB_TASK) {
        throw new BadRequestException('sub task cannot be parent task');
      }
      createTaskDto.type = TASK_TYPE.SUB_TASK;
    }

    const data = {
      ...createTaskDto,
      workspace: workspaceId,
      reporter: user.id,
      parent: parentId || null,
      status: TASK_STATUS.TO_DO,
      assignee:
        user.workspaceRole !== UserRole.ADMIN ? user.id : assigneeId || null,
    };
    const task = this.taskRepo.create(data);
    await this.taskRepo.getEntityManager().persistAndFlush(task);
    return task;
  }

  findAll(queryDto?: QueryDto & { workspaceId: number }) {
    return applyCustomQuery(queryDto, this.taskRepo, {
      workspace: queryDto.workspaceId,
    });
  }

  findOne(id: number) {
    return this.taskRepo.findOne(id, {
      populate: [
        'assignee',
        'reporter',
        'parent',
        'children',
        'dependencies',
        'dependents',
      ],
    });
  }

  async update(id: number, updateTaskDto: UpdateTaskDto, user: RequestUser) {
    const task = await this.checkTaskReporterPermission(id, user);
    return this.taskRepo.nativeUpdate(task.id, updateTaskDto);
  }

  async remove(id: number, user: RequestUser) {
    const task = await this.checkTaskReporterPermission(id, user);
    return this.taskRepo.nativeDelete(task.id);
  }

  async createTaskLink(
    linkTaskDto: LinkTaskDto,
    user: RequestUser,
    workspaceId: number,
  ) {
    const { fromTaskId, toTaskId, type } = linkTaskDto;

    if (fromTaskId === toTaskId) {
      throw new BadRequestException('Cannot link task to itself');
    }

    const [fromTask, toTask] = await Promise.all([
      this.taskRepo.findOne({ id: fromTaskId, workspace: { id: workspaceId } }),
      this.taskRepo.findOne({ id: toTaskId, workspace: { id: workspaceId } }),
    ]);

    if (!fromTask || !toTask) {
      throw new BadRequestException('either source or target task not found');
    }
    this.validateTaskLink(fromTask, toTask, type, user);

    const taskDependency = this.taskDependencyRepo.create({
      fromTask: fromTaskId,
      toTask: toTaskId,
      type,
    });
    const em = this.taskDependencyRepo.getEntityManager();
    await em.persistAndFlush(taskDependency);
    return taskDependency;
  }

  async updateTaskLink(
    id: number,
    linkTaskDto: LinkTaskDto,
    user: RequestUser,
  ) {
    const { fromTaskId, toTaskId, type } = linkTaskDto;
    const taskDependency = await this.taskDependencyRepo.findOne(id, {
      populate: ['fromTask', 'toTask'],
    });
    if (!taskDependency) {
      throw new NotFoundException('task dependency not found');
    }
    const { fromTask, toTask } = taskDependency;
    this.validateTaskLink(fromTask, toTask, type, user);
    return this.taskDependencyRepo.nativeUpdate(id, {
      fromTask: fromTaskId,
      toTask: toTaskId,
      type,
    });
  }

  async removeTaskLink(id: number, user: RequestUser) {
    const taskDependency = await this.taskDependencyRepo.findOne(id, {
      populate: ['fromTask', 'toTask'],
    });
    if (!taskDependency) {
      throw new NotFoundException('task dependency not found');
    }
    const { fromTask, toTask } = taskDependency;
    if (
      user.workspaceRole !== UserRole.ADMIN &&
      fromTask.reporter?.id !== toTask.reporter?.id
    ) {
      throw new UnauthorizedException(
        'Only admin or reporter can delete task dependency',
      );
    }
    return this.taskDependencyRepo.nativeDelete(id);
  }

  async getTasksByStatus(workspaceId: number, status: TASK_STATUS) {
    const tasks = await this.taskRepo.find({
      workspace: { id: workspaceId },
      status,
    });
    return tasks;
  }

  async assignTaskToMember(
    assigneeId: number,
    taskId: number,
    workspaceId: number,
  ) {
    const user = await this.workspaceService.getWorkspaceUser(
      workspaceId,
      assigneeId,
    );
    if (!user) throw new BadRequestException('User not found in workspace');

    return this.taskRepo.nativeUpdate(taskId, { assignee: assigneeId });
  }

  async changeTaskStatus(
    statusDto: { status: TASK_STATUS },
    taskId: number,
    user: RequestUser,
  ) {
    const task = await this.checkTaskAssigneePermission(taskId, user);

    if (task.status === statusDto.status) return true;

    switch (statusDto.status) {
      case TASK_STATUS.DONE:
        await this.validateDoneStatus(taskId, task.workspace.id);
        break;
      case TASK_STATUS.IN_PROGRESS:
        await this.validateInProgressStatus(task.workspace.id);
        break;
    }
    return this.taskRepo.nativeUpdate(taskId, { status: statusDto.status });
  }

  private async checkTaskAssigneePermission(id: number, user: RequestUser) {
    const task = await this.taskRepo.findOne(id, {
      fields: ['assignee.id', 'status', 'id', 'workspace.id'],
    });

    if (!task) throw new NotFoundException('Task not found');
    if (
      task.assignee?.id !== user.id &&
      user.workspaceRole !== UserRole.ADMIN
    ) {
      throw new UnauthorizedException('Unauthorized');
    }
    return task;
  }

  private async checkTaskReporterPermission(id: number, user: RequestUser) {
    const task = await this.taskRepo.findOne(id, { fields: ['reporter.id'] });

    if (!task) throw new NotFoundException('Task not found');
    if (
      task.reporter?.id !== user.id &&
      user.workspaceRole !== UserRole.ADMIN
    ) {
      throw new UnauthorizedException('Unauthorized');
    }
    return task;
  }

  private async isBlockedTask(taskId: number, workspaceId: number) {
    const dependencies = await this.taskDependencyRepo.find({
      toTask: { id: taskId, workspace: { id: workspaceId } },
      type: TASK_DEPENDENCY_TYPE.BLOCKS,
    });
    if (!dependencies.length) return false;
    return dependencies.some((dep) => dep.fromTask.status !== TASK_STATUS.DONE);
  }

  private async getHighPriorityTasks(workspaceId: number) {
    const tasks = await this.taskRepo.find({
      workspace: { id: workspaceId },
      priority: PRIORITY.HIGH,
    });
    return tasks;
  }

  private async getChildTasks(taskId: number) {
    const tasks = await this.taskRepo.find({
      parent: { id: taskId },
    });
    return tasks;
  }

  private async validateDoneStatus(taskId: number, workspaceId: number) {
    if (await this.isBlockedTask(taskId, workspaceId)) {
      throw new BadRequestException('Task is blocked');
    }

    const childTasks = await this.getChildTasks(taskId);
    if (childTasks?.some((task) => task?.status !== TASK_STATUS.DONE)) {
      throw new BadRequestException(
        'There are child tasks that must be done first',
      );
    }
  }

  private async validateInProgressStatus(workspaceId: number) {
    const highPriorityTasks = await this.getHighPriorityTasks(workspaceId);
    if (highPriorityTasks.length) {
      throw new BadRequestException(
        'There are high priority tasks that must be done first',
      );
    }
  }

  private validateTaskLink(
    fromTask: Task,
    toTask: Task,
    type: TASK_DEPENDENCY_TYPE,
    user: RequestUser,
  ) {
    if (
      fromTask.parent?.id === toTask.id ||
      toTask.parent?.id === fromTask.id
    ) {
      throw new BadRequestException('Parent and child already linked');
    }

    if (type === TASK_DEPENDENCY_TYPE.BLOCKS) {
      if (
        fromTask.reporter?.id !== toTask.reporter?.id &&
        user.workspaceRole !== UserRole.ADMIN
      ) {
        throw new UnauthorizedException(
          'Only reporter or admin can BLOCK tasks',
        );
      }

      if (
        fromTask.status === TASK_STATUS.DONE ||
        toTask.status === TASK_STATUS.DONE
      ) {
        throw new BadRequestException('Both tasks are already done');
      }

      if (toTask.priority === PRIORITY.HIGH) {
        throw new BadRequestException('Cannot block high-priority task');
      }
    }
  }
}
