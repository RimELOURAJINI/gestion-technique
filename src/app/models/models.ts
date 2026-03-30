export interface Role {
  id: number;
  name: string;
  description?: string;
}

export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  roles: Role[];
}

export interface Team {
  id: number;
  name: string;
  description: string;
  users?: User[];
}

export interface Project {
  id: number;
  name: string;
  description: string;
  status: string;
  startDate?: Date;
  expectedEndDate?: Date;
  deadline?: Date; // Added to fix compilation
  progress?: number; // Added to fix compilation
  budget?: number; // Added to fix compilation
  team?: Team;
  manager?: User;
}

export interface SubTask {
  id?: number;
  title: string;
  done: boolean;
  parentTaskId?: number;
}

export interface Task {
  id?: number;
  title: string;
  description?: string;
  status: string;
  priority: string;
  deadline?: Date;
  actualStartTime?: Date;
  actualEndTime?: Date;
  project?: Project;
  users?: User[];
  createdBy?: User;
  subtasks?: SubTask[]; // frontend-only local subtasks
  reclamations?: Reclamation[]; // Added for detail views
}

export interface Ticket {
  id?: number;
  subject: string;
  description: string;
  status: string;
  priority: string;
  createdBy?: User;
  createdAt?: Date;
}

export interface Reclamation {
  id?: number;
  title?: string;
  message: string;
  status?: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'REVIEWED';
  sender?: User;
  project?: Project;
  task?: Task;
  response?: string;
  createdAt?: Date;
}

