import { applyDecorators, SetMetadata, UseGuards } from '@nestjs/common';
import { RolesGuard } from '../guards/Roles-guard';
// import { WorkspaceAllowedGuard } from '../guards/workspace-role-guard';
import { UserRole } from 'src/workspace/entities/user-workspace.entity';
import { WORKSPACE_TASK_ROLES } from 'src/constants';

export function Allowed(...roles: UserRole[]) {
  return applyDecorators(SetMetadata('roles', roles), UseGuards(RolesGuard));
}

// export function WorkspaceAllowed(...roles: WORKSPACE_TASK_ROLES[]) {
//   return applyDecorators(
//     SetMetadata('workspace_roles', roles),
//     UseGuards(WorkspaceAllowedGuard),
//   );
// }
