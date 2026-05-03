import { DashboardWidget } from '@app/features/dashboard/models/dashboard-widget.model';
import { HeadcountData, SettingsData, FinancialData, ActivityItem } from '@app/features/dashboard/models/dashboard-base.model';
export function getAdminWidgets(data: {
    headcount: HeadcountData;
    financial: FinancialData;
    settings: SettingsData;
    activity: ActivityItem[];
}): DashboardWidget[] {
    return [
        { type: 'headcount', title: 'Headcount Overview', data: data.headcount },
        { type: 'financial', title: 'Financial Reports', data: data.financial },
        { type: 'settings', title: 'Company Settings', data: data.settings },
        { type: 'activity', title: 'Global Activity', data: data.activity },
    ];
}
