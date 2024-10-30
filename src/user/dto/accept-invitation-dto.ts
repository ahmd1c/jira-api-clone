import { IsJWT } from 'class-validator';

export class AcceptInviteDto {
  @IsJWT()
  inviteToken: string;
}
