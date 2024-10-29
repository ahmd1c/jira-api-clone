import { IsNotEmpty, IsPositive, IsString, Length } from 'class-validator';

export class CreateCompanyDto {
  @IsNotEmpty()
  @IsString()
  @Length(3, 50)
  name: string;

  @IsPositive()
  ownerId: number;
}
