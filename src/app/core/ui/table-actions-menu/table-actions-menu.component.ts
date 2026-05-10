import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { ConfirmDialogComponent } from '@app/core/ui/confirm-dialog/confirm-dialog.component';
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
    private readonly dialog = inject(MatDialog);
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
            this.dialog
                .open(ConfirmDialogComponent, {
                width: '420px',
                data: { message: action.confirmMessage },
            })
                .afterClosed()
                .subscribe((confirmed: boolean) => {
                if (!confirmed)
                    return;
                this.actionClick.emit(action.id);
            });
            return;
        }
        this.actionClick.emit(action.id);
    }
}
