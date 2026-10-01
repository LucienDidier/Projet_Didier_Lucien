import { Component } from '@angular/core';
import { Login } from './login/login';

@Component({
  imports: [Login],
  selector: 'app-root',
  styleUrl: './app.scss',
  templateUrl: './app.html',
})
export class App {}
