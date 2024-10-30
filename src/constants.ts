export enum UserRole {
  ADMIN = 'ADMIN',
  USER = 'USER',
}

export enum WORKSPACE_TASK_ROLES {
  ADMIN = 'ADMIN',
  USER = 'USER',
  TASK_REPORTER = 'TASK_REPORTER',
  TASK_ASSIGNEED = 'TASK_ASSIGNEED',
}

export enum TASK_DEPENDENCY_TYPE {
  RELATED_TO = 'RELATED_TO',
  CAUSES = 'CAUSES',
  BLOCKS = 'BLOCKS',
}

export enum TASK_STATUS {
  TO_DO = 'TO_DO',
  IN_PROGRESS = 'IN_PROGRESS',
  DONE = 'DONE',
}

export enum PRIORITY {
  HIGH = 'HIGH',
  MEDIUM = 'MEDIUM',
  LOW = 'LOW',
}

export enum TASK_TYPE {
  BUG = 'BUG',
  TASK = 'TASK',
  SUB_TASK = 'SUB_TASK',
}
