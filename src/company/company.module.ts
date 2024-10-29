import { forwardRef, Module } from '@nestjs/common';
import { CompanyService } from './company.service';
import { CompanyController } from './company.controller';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Company } from './entities/company.entity';
import { CompanyOwnerGuard } from 'src/auth/guards/company-owner-guard';
import { UserModule } from 'src/user/user.module';
import { WorkspaceModule } from 'src/workspace/workspace.module';

@Module({
  imports: [
    MikroOrmModule.forFeature([Company]),
    forwardRef(() => UserModule),
    forwardRef(() => WorkspaceModule),
  ],
  controllers: [CompanyController],
  providers: [CompanyService, CompanyOwnerGuard],
  exports: [CompanyService],
})
export class CompanyModule {}
