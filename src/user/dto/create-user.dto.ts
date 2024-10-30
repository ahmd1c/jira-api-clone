import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Length,
  ValidateIf,
} from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty()
  @IsString()
  @Length(3, 50)
  name: string;

  @ValidateIf((o) => !o.inviteToken || (o.inviteToken && o.email))
  @IsNotEmpty()
  @IsEmail()
  @Length(8, 50)
  email: string;

  @IsNotEmpty()
  @Length(8, 30)
  password: string;
}
