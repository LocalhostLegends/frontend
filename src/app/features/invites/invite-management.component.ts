import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { MatTooltipModule } from '@angular/material/tooltip';
import { InviteService } from './services/invite.service';
import { Invite } from '@app/core/models/invite.model';
import { getInvitableRoles, UserRole } from '@app/core/constants/roles.constants';
import { AuthService } from '@app/core/services/auth.service';
import { finalize } from 'rxjs';
import { TableActionItem, TableActionsMenuComponent, } from '@app/core/ui/table-actions-menu/table-actions-menu.component';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { InviteSetupWizardDialogComponent, InviteSetupWizardDialogData, } from './invite-setup-wizard-dialog.component';
@Component({
    selector: 'app-invite-management',
    standalone: true,
    imports: [
        CommonModule,
        MatTableModule,
        MatButtonModule,
        MatIconModule,
        MatSnackBarModule,
        MatProgressSpinnerModule,
        MatCardModule,
        MatTooltipModule,
        TableActionsMenuComponent,
    ],
    templateUrl: './invite-management.component.html',
    styleUrls: ['./invite-management.component.scss'],
})
export class InviteManagementComponent implements OnInit {
    private inviteService = inject(InviteService);
    private snackBar = inject(MatSnackBar);
    private router = inject(Router);
    private route = inject(ActivatedRoute);
    private dialog = inject(MatDialog);
    readonly auth = inject(AuthService);
    invites = signal<Invite[]>([]);
    isLoading = signal(false);
    resendingIds = signal<Set<string>>(new Set());
    cancellingIds = signal<Set<string>>(new Set());
    displayedColumns: string[] = ['email', 'role', 'status', 'invitedAt', 'acceptedAt', 'actions'];
    ngOnInit() {
        this.loadInvites();
        const preset = this.route.snapshot.queryParamMap.get('role') as UserRole | null;
        const allowed = getInvitableRoles(this.auth.userRole());
        if (preset && allowed.includes(preset)) {
            queueMicrotask(() => {
                this.openInviteWizard({ presetRole: preset });
                void this.router.navigate([], { relativeTo: this.route, queryParams: {}, replaceUrl: true });
            });
        }
    }
    openInviteWizard(data?: InviteSetupWizardDialogData): void {
        this.dialog
            .open(InviteSetupWizardDialogComponent, {
            width: '560px',
            maxWidth: '95vw',
            disableClose: true,
            autoFocus: 'first-heading',
            data,
        })
            .afterClosed()
            .subscribe((result) => {
            if (result === 'sent') {
                this.loadInvites();
            }
        });
    }
    loadInvites() {
        this.isLoading.set(true);
        this.inviteService
            .getCompanyInvites()
            .pipe(finalize(() => this.isLoading.set(false)))
            .subscribe({
            next: (invites: Invite[]) => {
                const sorted = [...invites].sort((a, b) => {
                    const ta = new Date(a.createdAt || 0).getTime();
                    const tb = new Date(b.createdAt || 0).getTime();
                    return tb - ta;
                });
                this.invites.set(sorted);
            },
            error: () => {
                this.snackBar.open('Error loading invites', 'Close', { duration: 3000 });
            },
        });
    }
    onResendInvite(invite: Invite) {
        if (this.isResending(invite.id) || this.isCancelling(invite.id))
            return;
        this.resendingIds.update((ids) => new Set(ids).add(invite.id));
        this.inviteService
            .resendInvite(invite.id)
            .pipe(finalize(() => this.resendingIds.update((ids) => {
            const next = new Set(ids);
            next.delete(invite.id);
            return next;
        })))
            .subscribe({
            next: () => {
                this.snackBar.open('Invite resent successfully', 'Close', { duration: 3000 });
            },
            error: () => {
                this.snackBar.open('Error resending invite', 'Close', { duration: 3000 });
            },
        });
    }
    onCancelInvite(invite: Invite) {
        if (this.isCancelling(invite.id) || this.isResending(invite.id))
            return;
        this.cancellingIds.update((ids) => new Set(ids).add(invite.id));
        this.inviteService
            .cancelInvite(invite.id)
            .pipe(finalize(() => this.cancellingIds.update((ids) => {
            const next = new Set(ids);
            next.delete(invite.id);
            return next;
        })))
            .subscribe({
            next: () => {
                this.snackBar.open('Invitation deleted', 'Close', { duration: 3000 });
                this.loadInvites();
            },
            error: () => {
                this.snackBar.open('Error cancelling invite', 'Close', { duration: 3000 });
            },
        });
    }
    canShowInviteActions(invite: Invite): boolean {
        const s = this.normalizeStatus(invite.status);
        return s === 'pending' || s === 'expired';
    }
    getActionsForInvite(invite: Invite): TableActionItem[] {
        const disabled = this.isResending(invite.id) || this.isCancelling(invite.id);
        return [
            {
                id: 'resend',
                label: 'Resend',
                icon: 'refresh',
                disabled,
            },
            {
                id: 'cancel',
                label: 'Delete invite',
                icon: 'delete_outline',
                disabled,
                confirmMessage: `Delete invitation for ${invite.email}? This cannot be undone.`,
            },
        ];
    }
    normalizeStatus(status: string | undefined): string {
        return (status ?? '').trim().toLowerCase();
    }
    statusLabel(invite: Invite): string {
        const s = this.normalizeStatus(invite.status);
        switch (s) {
            case 'pending':
                return 'Pending';
            case 'accepted':
                return 'Accepted';
            case 'expired':
                return 'Expired';
            case 'cancelled':
                return 'Cancelled';
            default:
                return invite.status ? invite.status : '—';
        }
    }
    isAccepted(invite: Invite): boolean {
        return this.normalizeStatus(invite.status) === 'accepted';
    }
    onInviteAction(actionId: string, invite: Invite): void {
        if (actionId === 'resend') {
            this.onResendInvite(invite);
            return;
        }
        if (actionId === 'cancel') {
            this.onCancelInvite(invite);
        }
    }
    invitedOn(invite: Invite): string | null {
        const raw = invite.createdAt?.trim();
        return raw || null;
    }
    acceptedOn(invite: Invite): string | null {
        const raw = invite.acceptedAt?.trim();
        return raw || null;
    }
    isResending(id: string): boolean {
        return this.resendingIds().has(id);
    }
    isCancelling(id: string): boolean {
        return this.cancellingIds().has(id);
    }
    getStatusColor(invite: Invite): string {
        const status = this.normalizeStatus(invite.status);
        switch (status) {
            case 'pending':
                return '#ed6c02';
            case 'accepted':
                return '#2e7d32';
            case 'expired':
                return '#c62828';
            case 'cancelled':
                return '#757575';
            default:
                return 'rgba(0,0,0,0.87)';
        }
    }
}
