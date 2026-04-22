export interface HeadcountData {
  total: number;
  turnover: number;
}

export interface FinancialData {
  salaryExpenses: number;
  charts: unknown[];
}

export interface SettingsData {
  name: string;
  logo: string;
}

export interface ActivityItem {
  action: string;
  time: string;
}

export interface PipelineData {
  candidates: number;
  responses: number;
}

export interface LeavesData {
  employees: string[];
}

export interface BirthdaysData {
  employees: string[];
}

export interface VacationData {
  balance: number;
  used: number;
}

export interface RequestsDataItem {
  type: string;
  count: number;
  details: string;
}

export type RequestsData = RequestsDataItem[];

export interface CoursesData {
  completed: number;
  inProgress: number;
}

export interface TeamData {
  online: number;
  total: number;
}
