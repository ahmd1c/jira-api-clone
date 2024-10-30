import { MikroOrmModuleOptions } from '@mikro-orm/nestjs';
import { PostgreSqlDriver } from '@mikro-orm/postgresql';

const config: MikroOrmModuleOptions = {
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  dbName: process.env.DB_NAME,
  driver: PostgreSqlDriver,
  entities:
    process.env.NODE_ENV === 'production' ? ['dist/**/*.entity.js'] : [],
  entitiesTs: ['src/**/*.entity.ts'],
  debug: true,
  autoLoadEntities: true,
  migrations: {
    path: 'dist/src/migrations/',
    glob: '!(*.d).{js,ts}',
    pathTs: 'src/migrations/',
  },
};

export default config;
