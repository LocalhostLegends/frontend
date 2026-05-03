import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef, } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
@Component({
    selector: 'app-invite-success-dialog',
    standalone: true,
    imports: [MatDialogModule, MatButtonModule, MatIconModule],
    template: `
    <div class="dialog-body">
      <mat-icon class="ok" aria-hidden="true">check_circle</mat-icon>
      <h2 class="title">Invitation Sent Successfully!</h2>
      <mat-dialog-actions align="center">
        <button mat-flat-button color="primary" (click)="close()">Back to Dashboard</button>
      </mat-dialog-actions>
    </div>
  `,
    styles: [
        `
      .dialog-body {
        padding: 1rem 1rem 0.5rem;
        text-align: center;
      }
      .ok {
        font-size: 3rem;
        width: 3rem;
        height: 3rem;
        color: #2e7d32;
      }
      .title {
        margin: 0.5rem 0 1rem;
        font-size: 1.125rem;
        font-weight: 600;
      }
    `,
    ],
})
export class InviteSuccessDialogComponent {
    constructor(private dialogRef: MatDialogRef<InviteSuccessDialogComponent>) { }
    close(): void {
        this.dialogRef.close(true);
    }
}
