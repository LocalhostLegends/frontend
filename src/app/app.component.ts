import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ApiService } from './services/api.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class App implements OnInit {
  constructor(private api: ApiService) {}

  ngOnInit() {
    // Test call removed - was causing 401 errors
    // this.api.getUsers().subscribe({
    //   next: (data) => console.log('USERS:', data),
    //   error: (err) => console.error('ERROR:', err),
    // });
  }
}
