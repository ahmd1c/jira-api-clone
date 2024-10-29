import {
  Cascade,
  Collection,
  Entity,
  ManyToOne,
  OneToMany,
  Property,
} from '@mikro-orm/core';
import { BaseEntity } from 'src/base.entity';
import { User } from 'src/user/entities/user.entity';
import { TaskDependency } from './task-dependency.entity';
import { Workspace } from 'src/workspace/entities/workspace.entity';

export enum TASK_STATUS {
  TO_DO = 'TO_DO',
  IN_PROGRESS = 'IN_PROGRESS',
  DONE = 'DONE',
}

export enum PRIORITY {
  HIGH = 'HIGH',
  MEDIUM = 'MEDIUM',
  LOW = 'LOW',
}

export enum TASK_TYPE {
  BUG = 'BUG',
  TASK = 'TASK',
  SUB_TASK = 'SUB_TASK',
}

@Entity()
export class Task extends BaseEntity {
  @Property()
  title!: string;

  @Property()
  description!: string;

  @Property({ default: TASK_STATUS.TO_DO, index: true })
  status!: TASK_STATUS;

  @Property()
  deadline!: Date;

  @Property({ default: PRIORITY.MEDIUM, index: true })
  priority!: PRIORITY;

  @Property({ default: TASK_TYPE.TASK })
  type!: TASK_TYPE;

  @ManyToOne(() => User, {
    deleteRule: 'SET NULL',
    updateRule: 'cascade',
    serializer: (value, _) => value?.id,
  })
  reporter!: User;

  @ManyToOne(() => User, {
    deleteRule: 'SET NULL',
    updateRule: 'cascade',
    nullable: true,
    serializer: (value, _) => (value?.id ? value?.id : null),
  })
  assignee?: User;

  @ManyToOne(() => Workspace, {
    cascade: [Cascade.ALL],
    serializer: (value, _) => value?.id,
  })
  workspace!: Workspace;

  @ManyToOne(() => Task, {
    nullable: true,
    cascade: [Cascade.ALL],
    serializer: (value, _) => value?.id || null,
  })
  parent?: Task;

  @OneToMany(() => Task, (task) => task.parent, {
    serializer: (value, _) =>
      value.isInitialized() ? value.getIdentifiers() : [],
  })
  children = new Collection<Task>(this);

  @OneToMany(
    () => TaskDependency,
    (taskDependency) => taskDependency.fromTask,
    {
      serializer: (value, _) =>
        value.isInitialized() ? value.getIdentifiers() : [],
    },
  )
  dependencies = new Collection<Task>(this);

  @OneToMany(() => TaskDependency, (taskDependency) => taskDependency.toTask, {
    serializer: (value, _) =>
      value.isInitialized() ? value.getIdentifiers() : [],
  })
  dependents = new Collection<Task>(this);
}
