import {
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
  Length,
  ValidateIf,
} from 'class-validator';
import { PRIORITY, TASK_TYPE } from 'src/constants';

export class CreateTaskDto {
  @IsNotEmpty()
  @IsString()
  @Length(5, 50)
  title!: string;

  @IsNotEmpty()
  @IsString()
  @Length(5, 500)
  description!: string;

  @IsNotEmpty()
  // @IsDateString()
  @IsDate()
  deadline!: Date;

  @IsNotEmpty()
  @IsEnum(PRIORITY)
  priority!: PRIORITY;

  @ValidateIf(
    (o) => {
      return (
        (o.type !== TASK_TYPE.SUB_TASK && !o.parentId) ||
        (o.type === TASK_TYPE.SUB_TASK && o.parentId)
      );
    },
    {
      message: 'Parent id should only be set if creating a sub task',
    },
  )
  @IsNotEmpty()
  @IsEnum(TASK_TYPE)
  type!: TASK_TYPE;

  @ValidateIf((o) => o.type === TASK_TYPE.SUB_TASK, {
    message: 'Parent id is required if creating a sub task',
  })
  @IsPositive()
  parentId?: number;

  @IsOptional()
  @IsPositive()
  assigneeId?: number;
}
