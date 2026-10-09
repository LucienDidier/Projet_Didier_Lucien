import { Component } from '@angular/core';
import { PollutionDeclaration } from './pollution-declaration/pollution-declaration';

@Component({
  imports: [PollutionDeclaration],
  selector: 'app-root',
  styleUrl: './app.scss',
  templateUrl: './app.html',
})
export class App {}
