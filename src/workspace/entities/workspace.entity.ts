import {
  Cascade,
  Collection,
  Entity,
  ManyToMany,
  ManyToOne,
  OneToMany,
  Property,
} from '@mikro-orm/core';
import { BaseEntity } from 'src/base.entity';
import { Company } from 'src/company/entities/company.entity';
import { User } from 'src/user/entities/user.entity';
import { UserWorkspace } from './user-workspace.entity';
import { Task } from 'src/task/entities/task.entity';

@Entity()
export class Workspace extends BaseEntity {
  @Property()
  name!: string;

  @ManyToOne(() => Company, {
    cascade: [Cascade.ALL],
    serializer: (val, _) => val.id,
    nullable: false,
  })
  company!: Company;

  @ManyToMany(() => User, (user) => user.workspaces, {
    pivotEntity: () => UserWorkspace,
    lazy: true,
    owner: true,
  })
  users = new Collection<User>(this);

  @OneToMany(() => Task, (task) => task.workspace, {
    lazy: true,
  })
  tasks = new Collection<Task>(this);
}
