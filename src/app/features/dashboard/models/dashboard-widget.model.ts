import { Invite } from '../../../core/models/invite.model';
import {
  HeadcountData,
  FinancialData,
  SettingsData,
  ActivityItem,
  PipelineData,
  LeavesData,
  BirthdaysData,
  VacationData,
  RequestsData,
  CoursesData,
  TeamData,
} from './dashboard-base.model';

export type DashboardWidget =
  | { type: 'headcount'; title: string; data: HeadcountData }
  | { type: 'financial'; title: string; data: FinancialData }
  | { type: 'settings'; title: string; data: SettingsData }
  | { type: 'activity'; title: string; data: ActivityItem[] }
  | { type: 'invites'; title: string; data: Invite[] }
  | { type: 'pipeline'; title: string; data: PipelineData }
  | { type: 'leaves'; title: string; data: LeavesData }
  | { type: 'birthdays'; title: string; data: BirthdaysData }
  | { type: 'vacation'; title: string; data: VacationData }
  | { type: 'requests'; title: string; data: RequestsData }
  | { type: 'courses'; title: string; data: CoursesData }
  | { type: 'team'; title: string; data: TeamData };
