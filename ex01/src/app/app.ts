import { HttpClientModule } from '@angular/common/http';
import { Component } from '@angular/core';
import { PollutionDeclaration } from './pollution-declaration/pollution-declaration';
import { SignUp } from './sign-up/sign-up';

@Component({
  imports: [HttpClientModule, SignUp, PollutionDeclaration],
  selector: 'app-root',
  styleUrl: './app.scss',
  templateUrl: './app.html',
})
export class App {}
