import { IsEnum } from 'class-validator';
import { TASK_STATUS } from 'src/constants';

export class TaskStatusDto {
  @IsEnum(TASK_STATUS)
  status!: TASK_STATUS;
}
