import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CompanyService } from 'src/company/company.service';

@Injectable()
export class CompanyOwnerGuard implements CanActivate {
  constructor(private companyService: CompanyService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    // could be args[0] and will be faster but may the order of args change so for now
    // we will use args.find for safety
    const args = context.getArgs();
    const companyId = args.find((arg) =>
      arg?.hasOwnProperty('companyId'),
    )?.companyId;

    if (!companyId && !req.params?.companyId) {
      throw new BadRequestException('Company id must be provided');
    }

    return (
      req.user.company?.id === parseInt(companyId || req.params?.companyId)
    );
  }
}
