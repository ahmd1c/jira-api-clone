import { IsEmail, IsEnum } from 'class-validator';
import { UserRole } from 'src/constants';

export class InviteUserDto {
  @IsEmail()
  email: string;

  @IsEnum(UserRole)
  role: UserRole;
}
