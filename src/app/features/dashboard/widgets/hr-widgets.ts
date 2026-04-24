import { DashboardWidget } from '../models/dashboard-widget.model';
import { Invite } from '../../../core/models/invite.model';

export function getHrWidgets(data: {
  invites: Invite[];
  pipeline: { candidates: number; responses: number };
  leaves: { employees: string[] };
  birthdays: { employees: string[] };
}): DashboardWidget[] {
  return [
    {
      type: 'invites',
      title: 'Pending Invites',
      data: data.invites,
    },
    {
      type: 'pipeline',
      title: 'Hiring Pipeline',
      data: data.pipeline,
    },
    {
      type: 'leaves',
      title: 'Today’s Leaves',
      data: data.leaves,
    },
    {
      type: 'birthdays',
      title: 'Birthdays',
      data: data.birthdays,
    },
  ];
}
