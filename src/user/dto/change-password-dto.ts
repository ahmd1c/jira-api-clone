import { IsNotEmpty, IsString, Length } from 'class-validator';

export class ChangePasswordDto {
  @IsNotEmpty()
  @IsString()
  @Length(8, 20)
  oldPassword: string;

  @IsNotEmpty()
  @IsString()
  @Length(8, 20)
  newPassword: string;
}
