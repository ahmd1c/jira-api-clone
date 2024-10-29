import { IsNotEmpty, IsString, Length } from 'class-validator';

export class WorkspaceDto {
  @IsNotEmpty()
  @IsString()
  @Length(3, 50)
  name: string;
}
