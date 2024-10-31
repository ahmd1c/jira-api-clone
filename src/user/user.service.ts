import {
  BadRequestException,
  ConflictException,
  forwardRef,
  Inject,
  Injectable,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository } from '@mikro-orm/postgresql';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcrypt';
import { WorkspaceService } from 'src/workspace/workspace.service';
import { QueryDto } from 'utils/query-prepare';
import { applyCustomQuery } from 'utils/apply-custom-query';
import { EntityDictionary } from '@mikro-orm/core/typings';
import { ChangePasswordDto } from './dto/change-password-dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: EntityRepository<User>,
    @Inject(forwardRef(() => WorkspaceService))
    private readonly workspaceService: WorkspaceService,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const { email, name, password } = createUserDto;

    const userExists = await this.userRepo.findOne(
      { email },
      { fields: ['id'] },
    );
    if (userExists) {
      throw new ConflictException('User already exists!');
    }

    return this.userRepo.create({
      name,
      email,
      password: await bcrypt.hash(password, 11),
    });
  }

  async save(user: User) {
    return this.userRepo.getEntityManager().persistAndFlush(user);
  }

  async acceptInvitation(inviteToken: string) {
    const { workspaceId, email, role } =
      await this.workspaceService.validateInviteToken(inviteToken);

    const user = await this.userRepo.findOne({ email }, { fields: ['id'] });
    if (!user) {
      throw new BadRequestException('User does not exist!');
    }

    const workspace = await this.workspaceService.findOne(workspaceId);
    if (!workspace) {
      throw new BadRequestException('Workspace does not exist!');
    }

    const userWorkspaceExists = await this.workspaceService.getWorkspaceUser(
      workspaceId,
      user.id,
    );

    if (userWorkspaceExists) {
      throw new BadRequestException('User already exists in workspace!');
    }

    const userWorkspace = this.workspaceService.addUser(workspace, user, role);
    await this.save(user as User);
    return userWorkspace;
  }

  async findAll(queryString?: QueryDto) {
    if (!queryString) return applyCustomQuery({ limit: 20 }, this.userRepo);
    if (queryString?.fields?.length) {
      queryString.fields = queryString.fields.filter((field) => {
        if (field === 'password') return false;
        return User.prototype.hasOwnProperty(field);
      });
    }
    return applyCustomQuery(queryString, this.userRepo);
  }

  findOne(where: Partial<User>, fields?: (keyof EntityDictionary<User>)[]) {
    return this.userRepo.findOne(where, { fields, refresh: true });
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return this.userRepo.nativeUpdate(id, updateUserDto);
  }

  async changePassword(id: number, changePasswordDto: ChangePasswordDto) {
    const user = await this.findOne({ id }, ['password']);
    if (!user) {
      throw new BadRequestException('User does not exist');
    }

    if (!(await bcrypt.compare(changePasswordDto.oldPassword, user.password))) {
      throw new BadRequestException('Old password is incorrect');
    }

    return this.userRepo.nativeUpdate(id, {
      password: await bcrypt.hash(changePasswordDto.newPassword, 11),
    });
  }

  remove(id: number) {
    return this.userRepo.nativeDelete(id);
  }
}
