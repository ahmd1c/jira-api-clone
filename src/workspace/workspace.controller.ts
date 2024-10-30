import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseEnumPipe,
  ParseIntPipe,
  HttpCode,
  Query,
  BadRequestException,
} from '@nestjs/common';
import { WorkspaceService } from './workspace.service';
import { WorkspaceDto } from './dto/workspace.dto';
import User from 'src/auth/decorators/user-decorator';
import { UserRole } from 'src/constants';
import { CompanyOwnerGuard } from 'src/auth/guards/company-owner-guard';
import {
  WorkspaceAdminGuard,
  WorkspaceGuard,
} from 'src/auth/guards/workspace-guard';
import { InviteUserDto } from './dto/invite-user-dto';

@Controller('workspaces')
export class WorkspaceController {
  constructor(private readonly workspaceService: WorkspaceService) {}

  @UseGuards(CompanyOwnerGuard)
  @Post()
  async create(
    @Body() workspaceDto: WorkspaceDto,
    @Query('companyId', ParseIntPipe) companyId: number,
    @User() user,
  ) {
    const workspace = await this.workspaceService.create(
      { ...workspaceDto, company: companyId },
      user,
    );
    await this.workspaceService.save(workspace);
    return workspace;
  }

  @UseGuards(CompanyOwnerGuard)
  @Get()
  findAll(@Query('companyId', ParseIntPipe) companyId: number) {
    return this.workspaceService.getAllWorkspacesInCompany(companyId);
  }

  @UseGuards(WorkspaceGuard, WorkspaceAdminGuard)
  @Get(':workspaceId')
  findOne(@Param('workspaceId') workspaceId: string) {
    return this.workspaceService.findOne(+workspaceId);
  }

  @UseGuards(WorkspaceGuard, WorkspaceAdminGuard)
  @Patch(':workspaceId')
  update(
    @Param('workspaceId') workspaceId: string,
    @Body() workspaceDto: WorkspaceDto,
  ) {
    const result = this.workspaceService.update(+workspaceId, workspaceDto);
    return {
      message: result
        ? 'Workspace updated successfully'
        : 'Workspace not found',
      status: result ? 'success' : 'fail',
    };
  }

  @UseGuards(CompanyOwnerGuard)
  @Delete(':workspaceId')
  remove(@Param('workspaceId') workspaceId: string) {
    const result = this.workspaceService.remove(+workspaceId);
    return {
      message: result
        ? 'Workspace deleted successfully'
        : 'Workspace not found',
      status: result ? 'success' : 'fail',
    };
  }

  @UseGuards(WorkspaceGuard)
  @Get(':workspaceId/users')
  getWorkspaceUsers(@Param('workspaceId') workspaceId: string) {
    return this.workspaceService.getWorkspaceUsers(+workspaceId);
  }

  @UseGuards(WorkspaceGuard, WorkspaceAdminGuard)
  @Post(':workspaceId/users/invite')
  @HttpCode(200)
  async addUserToWorkspace(
    @Body() inviteUserDto: InviteUserDto,
    @Param('workspaceId') workspaceId: string,
  ) {
    const token = await this.workspaceService.inviteUser(
      inviteUserDto,
      +workspaceId,
    );
    return { token };
  }

  @UseGuards(WorkspaceGuard, WorkspaceAdminGuard)
  @Delete(':workspaceId/users/:userId')
  async removeUser(
    @Param('workspaceId') workspaceId: string,
    @Param('userId') userId: string,
    @User() user,
  ) {
    const result = await this.workspaceService.removeUser(
      +workspaceId,
      +userId,
      user,
    );
    return {
      message: result ? 'User removed successfully' : 'User not found',
      status: result ? 'success' : 'fail',
    };
  }

  @UseGuards(WorkspaceGuard, WorkspaceAdminGuard)
  @Patch(':workspaceId/users/:userId/change-role')
  async changeUserRole(
    @Body(
      'newRole',
      new ParseEnumPipe(UserRole, {
        exceptionFactory(error) {
          throw new BadRequestException('newRole should be USER OR ADMIN');
        },
      }),
    )
    newRole: UserRole,
    @Param('workspaceId') workspaceId: string,
    @Param('userId') userId: string,
    @User() user,
  ) {
    const result = await this.workspaceService.changeUserRole(
      +workspaceId,
      +userId,
      newRole,
      user,
    );
    return {
      message: result ? 'User role changed successfully' : 'User not found',
      status: result ? 'success' : 'fail',
    };
  }
}
