import { Entity, ManyToOne, Property } from '@mikro-orm/core';
import { User } from 'src/user/entities/user.entity';
import { Workspace } from './workspace.entity';
import { UserRole } from 'src/constants';

@Entity()
export class UserWorkspace {
  @ManyToOne(() => User, {
    primary: true,
    deleteRule: 'cascade',
    updateRule: 'cascade',
  })
  user: User;

  @ManyToOne(() => Workspace, {
    primary: true,
    deleteRule: 'cascade',
    updateRule: 'cascade',
  })
  workspace: Workspace;

  @Property({ default: UserRole.USER })
  role: UserRole;
}
