import { IsEnum } from 'class-validator';
import { TASK_STATUS } from '../entities/task.entity';

export class TaskStatusDto {
  @IsEnum(TASK_STATUS)
  status!: TASK_STATUS;
}
