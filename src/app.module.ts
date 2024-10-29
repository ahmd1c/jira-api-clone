import * as dotenv from 'dotenv';
dotenv.config();
import { Module, OnModuleInit } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { TaskModule } from './task/task.module';
import { WorkspaceModule } from './workspace/workspace.module';
import { CompanyModule } from './company/company.module';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import dbConfig from './config/mikro-orm-config';
import { MikroORM } from '@mikro-orm/postgresql';
import { AuthModule } from './auth/auth.module';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    UserModule,
    TaskModule,
    WorkspaceModule,
    CompanyModule,
    MikroOrmModule.forRoot(dbConfig),
    AuthModule,
    JwtModule.register({}),
  ],
  controllers: [],
  providers: [],
})
export class AppModule implements OnModuleInit {
  constructor(private readonly orm: MikroORM) {}

  async onModuleInit() {
    // checks if the database is up to date and creates migrations if not
    console.log('running migrations...');
    await this.orm.getMigrator().createMigration();
    await this.orm.getMigrator().up();
  }
}
