import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  Injectable,
} from '@nestjs/common';
import { UserRole } from 'src/constants';
import { WorkspaceService } from 'src/workspace/workspace.service';

@Injectable()
export class WorkspaceGuard implements CanActivate {
  constructor(private readonly workspaceService: WorkspaceService) {}

  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const workspaceId = +request.params?.workspaceId;

    if (isNaN(workspaceId)) {
      throw new BadRequestException('workspaceId must be a valid number');
    }

    const member = await this.workspaceService.getWorkspaceUser(
      workspaceId,
      user.id,
    );

    if (!member?.role) return false;
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
