import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { UserRole } from 'src/workspace/entities/user-workspace.entity';
import { WorkspaceService } from 'src/workspace/workspace.service';

@Injectable()
export class WorkspaceGuard implements CanActivate {
  constructor(private readonly workspaceService: WorkspaceService) {}

  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const workspaceId = request.params.workspaceId;

    const member = await this.workspaceService.getWorkspaceUser(
      workspaceId,
      user.id,
    );
    if (!member.role) return false;
    user.workspaceRole = member.role;
    return true;
  }
}

@Injectable()
export class WorkspaceAdminGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const memberRole = request.user?.workspaceRole;
    return memberRole === UserRole.ADMIN;
  }
}
