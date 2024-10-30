import { PostgreSqlDriver } from '@mikro-orm/postgresql';

export default {
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
    pathTs: 'src/migrations/',
  },
};
