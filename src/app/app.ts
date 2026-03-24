import { Component, OnInit } from '@angular/core';
import { ApiService } from './services/api.service';

@Component({
  selector: 'app-root',
  template: `<h1>Check console</h1>`,
})
export class App implements OnInit {
  constructor(private api: ApiService) {}

  ngOnInit() {
    this.api.getUsers().subscribe({
      next: (data) => console.log('USERS:', data),
      error: (err) => console.error('ERROR:', err),
    });
  }
}



