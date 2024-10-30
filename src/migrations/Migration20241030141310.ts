import { Migration } from '@mikro-orm/migrations';

export class Migration20241030141310 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table "user" ("id" serial primary key, "created_at" timestamptz not null, "updated_at" timestamptz not null default CURRENT_TIMESTAMP, "name" varchar(255) not null, "email" varchar(255) not null, "password" varchar(255) not null, "role" varchar(255) not null default 'USER');`);
    this.addSql(`alter table "user" add constraint "user_email_unique" unique ("email");`);

    this.addSql(`create table "company" ("id" serial primary key, "created_at" timestamptz not null, "updated_at" timestamptz not null default CURRENT_TIMESTAMP, "name" varchar(255) not null, "owner_id" int not null);`);
    this.addSql(`alter table "company" add constraint "company_name_unique" unique ("name");`);
    this.addSql(`alter table "company" add constraint "company_owner_id_unique" unique ("owner_id");`);

    this.addSql(`create table "workspace" ("id" serial primary key, "created_at" timestamptz not null, "updated_at" timestamptz not null default CURRENT_TIMESTAMP, "name" varchar(255) not null, "company_id" int not null);`);

    this.addSql(`create table "user_workspace" ("workspace_id" int not null, "user_id" int not null, "role" varchar(255) not null default 'USER', constraint "user_workspace_pkey" primary key ("workspace_id", "user_id"));`);

    this.addSql(`create table "task" ("id" serial primary key, "created_at" timestamptz not null, "updated_at" timestamptz not null default CURRENT_TIMESTAMP, "title" varchar(255) not null, "description" varchar(255) not null, "status" varchar(255) not null default 'TO_DO', "deadline" timestamptz not null, "priority" varchar(255) not null default 'MEDIUM', "type" varchar(255) not null default 'TASK', "reporter_id" int not null, "assignee_id" int null, "workspace_id" int null, "parent_id" int null);`);
    this.addSql(`create index "task_status_index" on "task" ("status");`);
    this.addSql(`create index "task_priority_index" on "task" ("priority");`);

    this.addSql(`create table "task_dependency" ("id" serial primary key, "created_at" timestamptz not null, "updated_at" timestamptz not null default CURRENT_TIMESTAMP, "to_task_id" int not null, "from_task_id" int not null, "type" varchar(255) not null);`);
    this.addSql(`alter table "task_dependency" add constraint "task_dependency_from_task_id_to_task_id_type_unique" unique ("from_task_id", "to_task_id", "type");`);

    this.addSql(`alter table "company" add constraint "company_owner_id_foreign" foreign key ("owner_id") references "user" ("id") on update cascade on delete cascade;`);

    this.addSql(`alter table "workspace" add constraint "workspace_company_id_foreign" foreign key ("company_id") references "company" ("id") on update cascade on delete cascade;`);

    this.addSql(`alter table "user_workspace" add constraint "user_workspace_workspace_id_foreign" foreign key ("workspace_id") references "workspace" ("id") on update cascade on delete cascade;`);
    this.addSql(`alter table "user_workspace" add constraint "user_workspace_user_id_foreign" foreign key ("user_id") references "user" ("id") on update cascade on delete cascade;`);

    this.addSql(`alter table "task" add constraint "task_reporter_id_foreign" foreign key ("reporter_id") references "user" ("id") on update cascade on delete SET NULL;`);
    this.addSql(`alter table "task" add constraint "task_assignee_id_foreign" foreign key ("assignee_id") references "user" ("id") on update cascade on delete SET NULL;`);
    this.addSql(`alter table "task" add constraint "task_workspace_id_foreign" foreign key ("workspace_id") references "workspace" ("id") on update cascade on delete cascade;`);
    this.addSql(`alter table "task" add constraint "task_parent_id_foreign" foreign key ("parent_id") references "task" ("id") on update cascade on delete cascade;`);

    this.addSql(`alter table "task_dependency" add constraint "task_dependency_to_task_id_foreign" foreign key ("to_task_id") references "task" ("id") on update cascade on delete cascade;`);
    this.addSql(`alter table "task_dependency" add constraint "task_dependency_from_task_id_foreign" foreign key ("from_task_id") references "task" ("id") on update cascade on delete cascade;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table "company" drop constraint "company_owner_id_foreign";`);

    this.addSql(`alter table "user_workspace" drop constraint "user_workspace_user_id_foreign";`);

    this.addSql(`alter table "task" drop constraint "task_reporter_id_foreign";`);

    this.addSql(`alter table "task" drop constraint "task_assignee_id_foreign";`);

    this.addSql(`alter table "workspace" drop constraint "workspace_company_id_foreign";`);

    this.addSql(`alter table "user_workspace" drop constraint "user_workspace_workspace_id_foreign";`);

    this.addSql(`alter table "task" drop constraint "task_workspace_id_foreign";`);

    this.addSql(`alter table "task" drop constraint "task_parent_id_foreign";`);

    this.addSql(`alter table "task_dependency" drop constraint "task_dependency_to_task_id_foreign";`);

    this.addSql(`alter table "task_dependency" drop constraint "task_dependency_from_task_id_foreign";`);

    this.addSql(`drop table if exists "user" cascade;`);

    this.addSql(`drop table if exists "company" cascade;`);

    this.addSql(`drop table if exists "workspace" cascade;`);

    this.addSql(`drop table if exists "user_workspace" cascade;`);

    this.addSql(`drop table if exists "task" cascade;`);

    this.addSql(`drop table if exists "task_dependency" cascade;`);
  }

}
