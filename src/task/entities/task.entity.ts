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
import { TASK_STATUS, PRIORITY, TASK_TYPE } from 'src/constants';

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
    inversedBy: 'children',
    // serializer: (value, _) => value?.id || null,
  })
  parent?: Task;

  @OneToMany(() => Task, (task) => task.parent, {
    // serializer: (value, _) => {
    //   return value.toArray() || [];
    // },
    mappedBy: 'parent',
  })
  children = new Collection<Task>(this);

  @OneToMany(() => TaskDependency, (taskDependency) => taskDependency.fromTask)
  dependencies = new Collection<Task>(this);

  @OneToMany(() => TaskDependency, (taskDependency) => taskDependency.toTask)
  dependents = new Collection<Task>(this);
}
