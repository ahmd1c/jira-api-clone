import { CanActivate, ExecutionContext } from '@nestjs/common';
import { UserRole } from 'src/workspace/entities/user-workspace.entity';

export class OwnerOrAdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const id = +request.params.id;
    return user.id === id || user.role === UserRole.ADMIN;
  }
}
