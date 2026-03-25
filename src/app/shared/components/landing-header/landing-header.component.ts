import { Component } from '@angular/core';
import {  RouterLink } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';


@Component({
  selector: 'app-landing-header',
  standalone: true,
  imports: [MatToolbarModule, MatIconModule, MatButtonModule, RouterLink],
  templateUrl: './landing-header.component.html',
  styleUrl: './landing-header.component.scss',
})

export class LandingHeaderComponent {
  
}