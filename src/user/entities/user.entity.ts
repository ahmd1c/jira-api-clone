import {
  Collection,
  Entity,
  ManyToMany,
  OneToMany,
  OneToOne,
  Property,
  wrap,
} from '@mikro-orm/core';
import { BaseEntity } from 'src/base.entity';
import { Company } from 'src/company/entities/company.entity';
import { TaskDependency } from 'src/task/entities/task-dependency.entity';
import { Task } from 'src/task/entities/task.entity';
import {
  UserRole,
  UserWorkspace,
} from 'src/workspace/entities/user-workspace.entity';
import { Workspace } from 'src/workspace/entities/workspace.entity';

@Entity()
export class User extends BaseEntity {
  @Property()
  name!: string;

  @Property({ unique: true })
  email!: string;

  @Property({ hidden: true, lazy: true })
  password!: string;

  @Property({ default: UserRole.USER })
  role: UserRole;

  // One to one (as owner) because in jira every user can have only one company represented by the subdomain
  // in the sign up page
  @OneToOne(() => Company, (company) => company.owner, {
    serializer: (value) => ({ name: value?.name, id: value?.id }),
  })
  company: Company;

  @ManyToMany(() => Workspace, (workspace) => workspace.users, {
    pivotEntity: () => UserWorkspace,
    serializer: (value) => value?.id,
  })
  workspaces = new Collection<Workspace>(this);

  @OneToMany(() => Task, (task) => task.reporter, {
    serializer: (value) => value?.id,
  })
  createdTasks = new Collection<Task>(this);

  @OneToMany(() => Task, (task) => task.assignee, {
    serializer: (value) => value?.id,
  })
  tasks = new Collection<Task>(this);
}
