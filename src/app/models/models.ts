export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  roles?: string[];
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
  status?: string;
  sender?: User;
  project?: Project;
  task?: Task;
  createdAt?: Date;
}
