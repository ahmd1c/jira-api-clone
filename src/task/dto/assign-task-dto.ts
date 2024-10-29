import { IsPositive } from 'class-validator';

export class AssignTaskDto {
  @IsPositive()
  assigneeId: number;
}
