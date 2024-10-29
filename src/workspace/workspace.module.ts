import { forwardRef, Module } from '@nestjs/common';
import { WorkspaceService } from './workspace.service';
import { WorkspaceController } from './workspace.controller';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Workspace } from './entities/workspace.entity';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { UserWorkspace } from './entities/user-workspace.entity';
import { CompanyOwnerGuard } from 'src/auth/guards/company-owner-guard';
import {
  WorkspaceAdminGuard,
  WorkspaceGuard,
} from 'src/auth/guards/workspace-guard';
import { CompanyModule } from 'src/company/company.module';

@Module({
  imports: [
    MikroOrmModule.forFeature([Workspace, UserWorkspace]),
    JwtModule,
    forwardRef(() => CompanyModule),
  ],
  controllers: [WorkspaceController],
  providers: [
    WorkspaceService,
    CompanyOwnerGuard,
    WorkspaceGuard,
    WorkspaceAdminGuard,
  ],
  exports: [WorkspaceService],
})
export class WorkspaceModule {}
