import { DashboardWidget } from '@app/features/dashboard/models/dashboard-widget.model';
export function getEmployeeWidgets(data: {
    vacation: {
        balance: number;
        used: number;
    };
    requests: {
        type: string;
        count: number;
        details: string;
    }[];
    courses: {
        completed: number;
        inProgress: number;
    };
    team: {
        online: number;
        total: number;
    };
}): DashboardWidget[] {
    return [
        {
            type: 'vacation',
            title: 'Vacation Balance',
            data: data.vacation,
        },
        {
            type: 'requests',
            title: 'My Requests',
            data: data.requests,
        },
        {
            type: 'courses',
            title: 'Learning',
            data: data.courses,
        },
        {
            type: 'team',
            title: 'Team Online',
            data: data.team,
        },
    ];
}
