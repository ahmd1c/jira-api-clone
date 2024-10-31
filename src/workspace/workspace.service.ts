import { JwtService } from '@nestjs/jwt';
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { WorkspaceDto } from './dto/workspace.dto';
import { EntityRepository } from '@mikro-orm/postgresql';
import { Workspace } from './entities/workspace.entity';
import { InjectRepository } from '@mikro-orm/nestjs';
import { UserWorkspace } from './entities/user-workspace.entity';
import { InviteUserDto } from './dto/invite-user-dto';
import { User } from 'src/user/entities/user.entity';
import { Company } from 'src/company/entities/company.entity';
import { CompanyService } from 'src/company/company.service';
import { RequestUser } from 'types';
import { UserRole } from 'src/constants';

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

    if (!company) throw new BadRequestException('Company is required');

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
    // will throw not found error if workspace not found
    const workspace = await this.findOne(workspaceId);
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

  async changeUserRole(
    workspaceId: number,
    userId: number,
    newRole: UserRole,
    user: RequestUser,
  ) {
    if (!userId || isNaN(userId)) {
      throw new BadRequestException('Invalid user id');
    }

    const userWorkspace = await this.getWorkspaceUser(workspaceId, userId);

    if (!userWorkspace) {
      throw new BadRequestException('User not found in workspace');
    }

    if (userWorkspace.role === newRole) {
      throw new BadRequestException('User already has this role');
    }

    if (userWorkspace.role === UserRole.ADMIN) {
      const companyOwner = await this.getWorkspaceOwner(workspaceId);

      if (companyOwner.id === userId) {
        throw new BadRequestException('Company owner role cannot be changed');
      }

      if (!companyOwner || companyOwner.id !== user.id) {
        throw new ForbiddenException(
          'Only company owner can change admin role',
        );
      }
    }

    return this.userWorkspaceRepo.nativeUpdate(
      { workspace: workspaceId, user: userId },
      { role: newRole },
    );
  }

  async removeUser(workspaceId: number, userId: number, user: RequestUser) {
    if (!userId || isNaN(userId)) {
      throw new BadRequestException('User id is required');
    }

    const userWorkspace = await this.getWorkspaceUser(workspaceId, userId);

    if (!userWorkspace) {
      throw new BadRequestException('User not found in workspace');
    }

    if (userWorkspace.role === UserRole.ADMIN) {
      const companyOwner = await this.getWorkspaceOwner(workspaceId);

      if (companyOwner.id === userId) {
        throw new BadRequestException('Company owner cannot be removed');
      }

      if (!companyOwner || companyOwner.id !== user.id) {
        throw new ForbiddenException('Only company owner can remove admin');
      }
    }

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
    return userWorkspace;
  }

  getWorkspaceUsers(workspaceId: number) {
    return this.userWorkspaceRepo.find({ workspace: workspaceId });
  }

  getAllWorkspacesInCompany(companyId: number) {
    if (!companyId) {
      throw new BadRequestException('Company id is required');
    }
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

  async getWorkspaceOwner(workspaceId: number) {
    const workspace = await this.workspaceRepo.findOne(workspaceId, {
      fields: ['company.owner.id'],
      populate: ['company.owner.id'],
    });
    if (!workspace) {
      throw new NotFoundException('Workspace not found');
    }
    return workspace.company.owner;
  }
}
