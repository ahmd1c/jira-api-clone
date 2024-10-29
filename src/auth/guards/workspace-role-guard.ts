import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { WORKSPACE_TASK_ROLES } from 'src/constants';
import { TaskService } from 'src/task/task.service';
import { UserRole } from 'src/workspace/entities/user-workspace.entity';
import { WorkspaceService } from 'src/workspace/workspace.service';

// @Injectable()
// export class WorkspaceAllowedGuard implements CanActivate {
//   constructor(
//     private readonly workspaceService: WorkspaceService,
//     private readonly reflector: Reflector,
//     private readonly taskService: TaskService,
//   ) {}

//   async canActivate(context: ExecutionContext): Promise<boolean> {
//     const request = context.switchToHttp().getRequest();
//     const { taskId, workspaceId } = request.params;
//     const userId = request.user?.id;
//     const workspaceAllowedRules = this.reflector.getAllAndOverride(
//       'workspace_roles',
//       [context.getHandler(), context.getClass()],
//     );

//     const userWorkspaceRole = await this.workspaceService.getWorkspaceUserRole(
//       userId,
//       workspaceId,
//     );
//     if (userWorkspaceRole === UserRole.ADMIN) return true;

//     const task = await this.taskService.findOne(taskId);
//     if (
//       (task.assignee.id === userId &&
//         workspaceAllowedRules.includes(WORKSPACE_TASK_ROLES.TASK_ASSIGNEED)) ||
//       (task.reporter.id === userId &&
//         workspaceAllowedRules.includes(WORKSPACE_TASK_ROLES.TASK_REPORTER))
//     ) {
//       return true;
//     }

//     return false;
//   }
// }
