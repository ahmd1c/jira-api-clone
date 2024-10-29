import { JwtService } from '@nestjs/jwt';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { WorkspaceDto } from './dto/workspace.dto';
import { EntityRepository, MikroORM } from '@mikro-orm/postgresql';
import { Workspace } from './entities/workspace.entity';
import { InjectRepository } from '@mikro-orm/nestjs';
import { UserRole, UserWorkspace } from './entities/user-workspace.entity';
import { InviteUserDto } from './dto/invite-user-dto';
import { User } from 'src/user/entities/user.entity';
import { Company } from 'src/company/entities/company.entity';
import { CompanyService } from 'src/company/company.service';

@Injectable()
export class WorkspaceService {
  constructor(
    @InjectRepository(Workspace)
    private readonly workspaceRepo: EntityRepository<Workspace>,
    @InjectRepository(UserWorkspace)
    private readonly userWorkspaceRepo: EntityRepository<UserWorkspace>,
    private readonly companyService: CompanyService,
    private readonly jwtService: JwtService,
  ) {}

  async create(
    workspaceDto: WorkspaceDto & { company: Company | number },
    owner: User,
  ) {
    let { name, company } = workspaceDto;

    // create workspace for already exist company or as a part of company creation
    if (typeof company === 'number') {
      const companyExist = await this.companyService.findOne({ id: company }, [
        'id',
      ]);
      if (!companyExist) throw new BadRequestException('Company not exist');
      company = companyExist;
    }

    const workspace = this.workspaceRepo.create({
      name,
      company,
    });
    this.addUser(workspace, owner, UserRole.ADMIN);

    return workspace;
  }

  addUser(workspace: Workspace, user: Partial<User>, role: UserRole) {
    return this.userWorkspaceRepo.create({
      user,
      workspace,
      role: role || UserRole.USER,
    });
  }

  async inviteUser(inviteUserDto: InviteUserDto, workspaceId: number) {
    const inviteToken = await this.jwtService.signAsync(
      { ...inviteUserDto, workspaceId },
      {
        expiresIn: '3d',
        secret: process.env.INVITE_TOKEN_SECRET,
      },
    );
    // const inviteLink = `${process.env.CLIENT_URL}/invite?token=${inviteToken}`;
    // in production we can send an email but for easy testing we can just return the token
    return inviteToken;
  }

  async changeUserRole(workspaceId: number, userId: number, newRole: UserRole) {
    return this.userWorkspaceRepo.nativeUpdate(
      { workspace: workspaceId, user: userId },
      { role: newRole },
    );
  }

  removeUser(workspaceId: number, userId: number) {
    return this.userWorkspaceRepo.nativeDelete({
      workspace: workspaceId,
      user: userId,
    });
  }

  save(workspace: Workspace) {
    return this.workspaceRepo.getEntityManager().persistAndFlush(workspace);
  }

  async getWorkspaceUser(workspaceId: number, userId: number) {
    const userWorkspace = await this.userWorkspaceRepo.findOne(
      {
        workspace: workspaceId,
        user: userId,
      },
      { fields: ['role'] },
    );
    if (!userWorkspace) {
      throw new BadRequestException('User not found in workspace');
    }
    return userWorkspace;
  }

  getAllWorkspacesInCompany(companyId: number) {
    return this.workspaceRepo.findAll({
      where: { company: { id: companyId } },
      orderBy: { createdAt: 'DESC' },
    });
  }

  findOne(id: number) {
    const workspace = this.workspaceRepo.findOne(id);
    if (!workspace) {
      throw new NotFoundException('Workspace not found');
    }
    return workspace;
  }

  update(id: number, workspaceDto: WorkspaceDto) {
    return this.workspaceRepo.nativeUpdate(id, workspaceDto);
  }

  remove(id: number) {
    return this.workspaceRepo.nativeDelete(id);
  }

  validateInviteToken(inviteToken: string) {
    try {
      return this.jwtService.verifyAsync(inviteToken, {
        secret: process.env.INVITE_TOKEN_SECRET,
      });
    } catch (error) {
      throw new BadRequestException('Invalid invite token');
    }
  }
}
