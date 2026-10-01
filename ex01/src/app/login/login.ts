import { Component } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';

@Component({
  imports: [FormsModule],
  selector: 'app-login',
  styleUrl: './login.scss',
  templateUrl: './login.html',
})
export class Login {
  protected password = '';
  protected passwordConfirmation = '';
  protected lastName = '';
  protected firstName = '';
  protected email = '';

  protected submitted = false;

  protected submit(form: NgForm): void {
    if (
      form.valid &&
      this.password === this.passwordConfirmation
    ) {
      this.submitted = true;
    } else {
      this.submitted = false;
    }
  }
}
