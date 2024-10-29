// declare module Express {
//   export interface Request {
//     user: {role : string , id : number}
//   }
// }

import { UserRole } from 'src/workspace/entities/user-workspace.entity';

export interface RequestUser {
  role: UserRole;
  id: number;
  workspaceRole?: UserRole;
}
