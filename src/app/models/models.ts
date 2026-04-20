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
  skills?: string[]; // Added for AI task assignment recommendations
}

export interface Team {
  id: number;
  name: string;
  description: string;
  users?: User[];
  manager?: User;
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
  spentBudget?: number; // Added for AI statistics
  priorityLevel?: string; // e.g. CRITIQUE, NORMAL
  riskThreshold?: number; // e.g. 80 (%)
  teams?: Team[];
  manager?: User;
  client?: User;
  commercial?: User;
  openTicketsCount?: number; // UI Badge count
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
  estimatedHours?: number; // Added for AI statistics 
  actualHours?: number;    // Added for AI statistics
  type?: string;           // Added for AI statistics (e.g., BUG, FEATURE)
  qualityScore?: number;   // Added for AI statistics (e.g., 1 to 5)
  storyPoints?: number;    // Complexity 1-8
  isBlocked?: boolean;     // Blocker indicator
  blockerReason?: string;  // Reason for being blocked
  project?: Project;
  users?: User[];
  createdBy?: User;
  subtasks?: SubTask[]; // frontend-only local subtasks
  reclamations?: Reclamation[]; // Added for detail views
  openTicketsCount?: number; // UI Badge count
}

export interface Ticket {
  id?: number;
  subject: string;
  description: string;
  status: string;
  priority: string;
  createdBy?: User;
  createdAt?: string;
  type?: string;
  project?: Project;
  task?: Task;
  validatedAt?: string;
  lastMessageAt?: string;
}

export interface Reclamation {
  id?: number;
  title?: string;
  type?: string; // Added for AI statistics (e.g., TECHNIQUE)
  message: string;
  status?: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'REVIEWED';
  sender?: User;
  project?: Project;
  task?: Task;
  response?: string;
  createdAt?: Date;
}

export interface DailyReport {
  id?: number;
  userId?: number;
  user?: User;
  date?: string;
  tasksAccomplished: string;    // [TÂCHES ACCOMPLIES]
  problemsEncountered: string;  // [PROBLÈMES RENCONTRÉS]
  victories: string;            // [VICTOIRES DU JOUR]
  notes: string;                // [NOTES / REMARQUES]
  submittedAt?: string;
}

export interface DailyReportSummary {
  userId: number;
  userName: string;
  userRole: string;
  submitted: boolean;
  hasProblems: boolean;
  reportId?: number;
  submittedAt?: string;
}

