import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
export interface TableActionItem {
    id: string;
    label: string;
    icon?: string;
    disabled?: boolean;
    confirmMessage?: string;
}
@Component({
    selector: 'app-table-actions-menu',
    standalone: true,
    imports: [CommonModule, MatButtonModule, MatIconModule, MatMenuModule],
    templateUrl: './table-actions-menu.component.html',
    styleUrls: ['./table-actions-menu.component.scss'],
})
export class TableActionsMenuComponent {
    @Input()
    actions: TableActionItem[] = [];
    @Input()
    triggerAriaLabel = 'Row actions';
    @Input()
    triggerDisabled = false;
    @Output()
    actionClick = new EventEmitter<string>();
    onActionClick(action: TableActionItem): void {
        if (action.confirmMessage) {
            const confirmed = confirm(action.confirmMessage);
            if (!confirmed)
                return;
        }
        this.actionClick.emit(action.id);
    }
}
