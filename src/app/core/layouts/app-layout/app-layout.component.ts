import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from '../../../shared/components/header/header.component'; 

@Component({
  selector: 'app-app-layout',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent], 
  templateUrl: './app-layout.component.html',
  styleUrl: './app-layout.component.scss',
})
export class MainLayoutComponent {} 
