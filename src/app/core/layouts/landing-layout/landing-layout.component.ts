import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LandingHeaderComponent } from '../../../shared/components/landing-header/landing-header.component';

@Component({
  selector: 'app-landing-layout',
  standalone: true,
  imports: [RouterOutlet, LandingHeaderComponent],
  templateUrl: './landing-layout.component.html',
  styleUrl: './landing-layout.component.scss',
})
export class LandingLayoutComponent {} 
