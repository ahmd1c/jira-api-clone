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
  ParseIntPipe,
  NotFoundException,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Allowed } from 'src/auth/decorators/allowed-decorator';
import { UserRole } from 'src/constants';
import { QueryDto } from 'utils/query-prepare';
import { OwnerOrAdminGuard } from './guards/owner-guard';
import User from 'src/auth/decorators/user-decorator';
import { ChangePasswordDto } from './dto/change-password-dto';
import { AcceptInviteDto } from './dto/accept-invitation-dto';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UseGuards(OwnerOrAdminGuard)
  @Post(':id/accept-invitation')
  acceptInvitation(@Body() acceptInviteDto: AcceptInviteDto) {
    return this.userService.acceptInvitation(acceptInviteDto.inviteToken);
  }

  @Allowed(UserRole.ADMIN)
  @Get()
  findAll(@Query() queryString?: QueryDto) {
    return this.userService.findAll(queryString);
  }

  @UseGuards(OwnerOrAdminGuard)
  @Get(':id')
  findOne(@Param('id' , ParseIntPipe) id: number) {
    const user = this.userService.findOne({ id: id });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  @UseGuards(OwnerOrAdminGuard)
  @Put(':id')
  async update(@Param('id' , ParseIntPipe) id: number, @Body() updateUserDto: UpdateUserDto) {
    const result = await this.userService.update(id, updateUserDto);
    if (!result) throw new NotFoundException('User not found');
    return {
      message: result ? 'User deleted successfully' : 'User not found',
      status: result ? 'success' : 'fail',
    };
  }

  @Patch('change-password')
  async changePassword(
    @Body() changePasswordDto: ChangePasswordDto,
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
  async remove(@Param('id' , ParseIntPipe) id: number) {
    const result = await this.userService.remove(id);
    if (!result) throw new NotFoundException('User not found');
    return {
      message: result ? 'User deleted successfully' : 'User not found',
      status: result ? 'success' : 'fail',
    };
  }
}
