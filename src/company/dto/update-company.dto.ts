import { PartialType, PickType } from '@nestjs/mapped-types';
import { CreateCompanyDto } from './create-company.dto';

export class UpdateCompanyDto extends PickType(CreateCompanyDto , ['name']) {}
