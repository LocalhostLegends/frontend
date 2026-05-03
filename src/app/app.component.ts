import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
@Component({
    selector: 'app-root',
    standalone: true,
    imports: [RouterOutlet],
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
})
export class App implements OnInit {
    ngOnInit() {
        const theme = localStorage.getItem('theme');
        if (theme === 'dark') {
            document.body.classList.add('dark-theme');
        }
    }
}
