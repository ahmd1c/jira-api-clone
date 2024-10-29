import {
  Cascade,
  Collection,
  Entity,
  OneToMany,
  OneToOne,
  Property,
} from '@mikro-orm/core';
import { BaseEntity } from 'src/base.entity';
import { User } from 'src/user/entities/user.entity';
import { Workspace } from 'src/workspace/entities/workspace.entity';

@Entity()
export class Company extends BaseEntity {
  @Property({ unique: true })
  name!: string;

  @OneToOne(() => User, { cascade: [Cascade.ALL], nullable: false })
  owner!: User;

  @OneToMany(() => Workspace, (workspace) => workspace.company)
  workspaces? = new Collection<Workspace>(this);
}
