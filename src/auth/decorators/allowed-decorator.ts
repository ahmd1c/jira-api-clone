import { applyDecorators, SetMetadata, UseGuards } from '@nestjs/common';
import { RolesGuard } from '../guards/Roles-guard';
import { UserRole } from 'src/constants';

export function Allowed(...roles: UserRole[]) {
  return applyDecorators(SetMetadata('roles', roles), UseGuards(RolesGuard));
}
