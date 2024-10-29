import { Controller, Post, Body, UseGuards, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register-dto';
import { Public } from './decorators/public-decorator';
import { Response } from 'express';
import { LocalGuard } from './guards/local-guard';
import User from './decorators/user-decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('/register')
  async create(
    @Body() registerDto: RegisterDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.authService.register(registerDto, res);
  }

  @Public()
  @UseGuards(LocalGuard)
  @Post('/login')
  login(@User() user, @Res({ passthrough: true }) res: Response) {
    return this.authService.login(user, res);
  }

  @Post('/logout')
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('token');
    return { message: 'Logout successful' };
  }
}
