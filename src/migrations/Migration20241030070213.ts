import { Migration } from '@mikro-orm/migrations';

export class Migration20241030070213 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table "task_dependency" drop constraint "task_dependency_from_task_id_to_task_id_unique";`);

    this.addSql(`alter table "task_dependency" add constraint "task_dependency_from_task_id_to_task_id_type_unique" unique ("from_task_id", "to_task_id", "type");`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table "task_dependency" drop constraint "task_dependency_from_task_id_to_task_id_type_unique";`);

    this.addSql(`alter table "task_dependency" add constraint "task_dependency_from_task_id_to_task_id_unique" unique ("from_task_id", "to_task_id");`);
  }

}
