import { Entity, ManyToOne, Property, Unique } from '@mikro-orm/core';
import { Task } from './task.entity';
import { BaseEntity } from 'src/base.entity';
import { TASK_DEPENDENCY_TYPE } from 'src/constants';

@Entity()
@Unique({ properties: ['fromTask', 'toTask', 'type'] })
export class TaskDependency extends BaseEntity {
  @ManyToOne(() => Task, {
    deleteRule: 'cascade',
    updateRule: 'cascade',
  })
  toTask: Task;

  @ManyToOne(() => Task, {
    deleteRule: 'cascade',
    updateRule: 'cascade',
  })
  fromTask: Task;

  @Property()
  type!: TASK_DEPENDENCY_TYPE;
}
