import { BadRequestException, Injectable } from '@nestjs/common';
import { RegisterDto } from './dto/register-dto';
import { UserService } from 'src/user/user.service';
import { WorkspaceService } from 'src/workspace/workspace.service';
import { CompanyService } from 'src/company/company.service';
import { JwtService } from '@nestjs/jwt';
import { User } from 'src/user/entities/user.entity';
import { Response } from 'express';
import * as bcrypt from 'bcrypt';
import { UserRole } from 'src/constants';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly workspaceService: WorkspaceService,
    private readonly companyService: CompanyService,
    private readonly jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto, res: Response) {
    const { inviteToken, companyName } = registerDto;

    if (inviteToken) {
      console.log('registering with invitation...');
      return this.registerWithInvitation(registerDto, res);
    }

    const user = await this.userService.create(registerDto);

    const company = await this.companyService.create({
      name: companyName,
      ownerId: undefined,
      user,
    });

    const workspace = await this.workspaceService.create(
      {
        name: 'default',
        company: company,
      },
      user,
    );

    // just for testing purposes and will be removed later
    if (registerDto.email === 'test_admin@test.com') {
      user.role = UserRole.ADMIN;
    }
    await this.userService.save(user);
    return this.generateResponse(user, res);
  }

  async registerWithInvitation(registerDto: RegisterDto, res: Response) {
    const { email, inviteToken } = registerDto;

    const {
      email: invitedEmail,
      workspaceId,
      role,
    } = await this.workspaceService.validateInviteToken(inviteToken);

    if (email && email !== invitedEmail) {
      throw new BadRequestException('Email does not match');
    }
    const workspace = await this.workspaceService.findOne(workspaceId);

    const user = await this.userService.create({
      name: registerDto.name,
      password: registerDto.password,
      email: invitedEmail,
    });
    this.workspaceService.addUser(workspace, user, role);

    await this.userService.save(user);

    return this.generateResponse(user, res);
  }

  async login(user: User, res: Response) {
    return this.generateResponse(user, res);
  }

  async validateUser(email: string, password: string) {
    const user = await this.userService.findOne({ email }, [
      '*',
      'password',
      'company.name',
    ]);
    if (!user) return null;

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) return null;

    return user;
  }

  private async generateToken(payload: { role: string; id: number }) {
    return this.jwtService.signAsync(payload, {
      expiresIn: '7d',
      secret: process.env.JWT_SECRET,
    });
  }

  private async generateResponse(user: User, res: Response) {
    const token = await this.generateToken({ role: user.role, id: user.id });
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 1000 * 60 * 60 * 24 * 7,
    });
    return { user };
  }
}
