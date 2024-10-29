import {
  IsJWT,
  IsOptional,
  IsString,
  Length,
  ValidateIf,
} from 'class-validator';
import { CreateUserDto } from '../../user/dto/create-user.dto';

export class RegisterDto extends CreateUserDto {
  @ValidateIf((o) => {
    return (
      (!o.inviteToken && o.companyName) || (!o.companyName && !o.inviteToken)
    );
  })
  @IsString()
  @Length(3, 50)
  companyName?: string;

  @IsOptional()
  @IsJWT()
  inviteToken?: string;
}
