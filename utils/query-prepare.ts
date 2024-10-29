import { EntityKey } from '@mikro-orm/postgresql';
import { Transform } from 'class-transformer';
import { IsOptional, IsPositive, ValidateNested } from 'class-validator';

export class QueryDto {
  @IsOptional()
  @IsPositive()
  limit?: number;

  @IsOptional()
  @IsPositive()
  page?: number;

  @IsOptional()
  @ValidateNested()
  sort?:
    | string
    | {
        [key: string]: 'ASC' | 'DESC';
      };

  @IsOptional()
  @Transform(({ value }) => (value ? value.split(',') : []))
  fields?: EntityKey[];
}
