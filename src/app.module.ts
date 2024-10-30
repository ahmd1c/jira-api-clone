import * as dotenv from 'dotenv';
dotenv.config();
import { Module, OnModuleInit } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { TaskModule } from './task/task.module';
import { WorkspaceModule } from './workspace/workspace.module';
import { CompanyModule } from './company/company.module';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { MikroORM } from '@mikro-orm/postgresql';
import { AuthModule } from './auth/auth.module';
import { JwtModule } from '@nestjs/jwt';
import config from '../mikro-orm.config';
import { APP_GUARD } from '@nestjs/core';
import { minutes, ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';

@Module({
  imports: [
    UserModule,
    TaskModule,
    WorkspaceModule,
    CompanyModule,
    MikroOrmModule.forRoot(config),
    AuthModule,
    JwtModule.register({}),
    ThrottlerModule.forRoot([
      {
        ttl: minutes(15),
        limit: 100,
      },
    ]),
  ],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule implements OnModuleInit {
  constructor(private readonly orm: MikroORM) {}

  async onModuleInit() {
    // checks if the database is up to date and creates migrations if not
    // that's only for testing purposes , in production this should be removed
    console.log('running migrations... ');
    await this.orm.getMigrator().createMigration();
    await this.orm.getMigrator().up();
  }
}
