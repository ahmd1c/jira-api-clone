import { IsEnum, IsPositive } from 'class-validator';
import { TASK_DEPENDENCY_TYPE } from 'src/constants';

export class LinkTaskDto {
  @IsPositive()
  toTaskId: number;

  @IsPositive()
  fromTaskId: number;

  @IsEnum(TASK_DEPENDENCY_TYPE)
  type: TASK_DEPENDENCY_TYPE;
}

export class UpdateLinkTaskDto {
  @IsEnum(TASK_DEPENDENCY_TYPE)
  type: TASK_DEPENDENCY_TYPE;
}
