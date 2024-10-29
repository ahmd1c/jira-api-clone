import { IsEmail, IsEnum } from 'class-validator';
import { UserRole } from '../entities/user-workspace.entity';

export class InviteUserDto {
  @IsEmail()
  email: string;

  @IsEnum(UserRole)
  role: UserRole;
}
