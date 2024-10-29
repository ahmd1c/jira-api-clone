import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  Put,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Allowed } from 'src/auth/decorators/allowed-decorator';
import { UserRole } from 'src/workspace/entities/user-workspace.entity';
import { QueryDto } from 'utils/query-prepare';
import { OwnerOrAdminGuard } from './guards/owner-guard';
import User from 'src/auth/decorators/user-decorator';
import { ChangePasswordDto } from './dto/change-password-dto';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Allowed(UserRole.ADMIN)
  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @Post('/accept-invitation')
  acceptInvitation(@Body('inviteToken') inviteToken: string) {
    return this.userService.acceptInvitation(inviteToken);
  }

  @Allowed(UserRole.ADMIN)
  @Get()
  findAll(@Query() queryString?: QueryDto) {
    return this.userService.findAll(queryString);
  }

  @UseGuards(OwnerOrAdminGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userService.findOne({ id: +id });
  }

  @UseGuards(OwnerOrAdminGuard)
  @Put(':id')
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    const result = await this.userService.update(+id, updateUserDto);
    return {
      message: result ? 'User deleted successfully' : 'User not found',
      status: result ? 'success' : 'fail',
    };
  }

  @UseGuards(OwnerOrAdminGuard)
  @Patch('change-password')
  async changePassword(
    @Body('password') changePasswordDto: ChangePasswordDto,
    @User() user,
  ) {
    const result = await this.userService.changePassword(
      +user.id,
      changePasswordDto,
    );
    return {
      message: result ? 'password changed successfully' : 'User not found',
      status: result ? 'success' : 'fail',
    };
  }

  @UseGuards(OwnerOrAdminGuard)
  @Delete(':id')
  async remove(@Param('id') id: string) {
    const result = await this.userService.remove(+id);
    return {
      message: result ? 'User deleted successfully' : 'User not found',
      status: result ? 'success' : 'fail',
    };
  }
}