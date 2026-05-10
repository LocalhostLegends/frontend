import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { TranslatePipe } from '@ngx-translate/core';
@Component({
    selector: 'app-not-found',
    standalone: true,
    imports: [RouterModule, MatButtonModule, TranslatePipe],
    templateUrl: './not-found.component.html',
    styleUrl: './not-found.component.scss',
})
export class NotFoundComponent {
}
