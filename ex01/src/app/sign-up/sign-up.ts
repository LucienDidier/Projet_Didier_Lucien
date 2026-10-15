import { Component, inject } from '@angular/core';
import {
	AbstractControl,
	FormControl,
	FormGroup,
	ReactiveFormsModule,
	ValidationErrors,
	Validators,
} from '@angular/forms';
import { SignUpService } from './sign-up.service';

const personNamePattern = /^[\p{L}\p{M}]+(?:[ '\u2019-][\p{L}\p{M}]+)*$/u;
const strongPasswordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\da-zA-Z\s]).+$/;

function notBlank(control: AbstractControl<string>): ValidationErrors | null {
	return control.value.trim().length > 0 ? null : { blank: true };
}

function minTrimmedLength(minimum: number) {
	return (control: AbstractControl<string>): ValidationErrors | null => {
		const actualLength = control.value.trim().length;
		return actualLength >= minimum
			? null
			: { minlength: { requiredLength: minimum, actualLength } };
	};
}

function validPersonName(control: AbstractControl<string>): ValidationErrors | null {
	return Validators.pattern(personNamePattern)(new FormControl(control.value.trim()));
}

function validEmail(control: AbstractControl<string>): ValidationErrors | null {
	return Validators.email(new FormControl(control.value.trim()));
}

type SignUpForm = FormGroup<{
	name: FormControl<string>;
	email: FormControl<string>;
	password: FormControl<string>;
}>;

@Component({
	imports: [ReactiveFormsModule],
	selector: 'app-sign-up',
	styleUrl: './sign-up.scss',
	templateUrl: './sign-up.html',
})
export class SignUp {
	private readonly signUpService = inject(SignUpService);

	protected readonly form: SignUpForm = new FormGroup({
		name: new FormControl('', {
			nonNullable: true,
			validators: [
				Validators.required,
				notBlank,
				minTrimmedLength(2),
				Validators.maxLength(80),
				validPersonName,
			],
		}),
		email: new FormControl('', {
			nonNullable: true,
			validators: [
				Validators.required,
				notBlank,
				Validators.maxLength(254),
				validEmail,
			],
		}),
		password: new FormControl('', {
			nonNullable: true,
			validators: [
				Validators.required,
				Validators.minLength(8),
				Validators.maxLength(128),
				Validators.pattern(strongPasswordPattern),
			],
		}),
	});

	protected isSubmitting = false;
	protected successMessage = '';
	protected errorMessage = '';

	protected submit(): void {
		if (this.form.invalid || this.isSubmitting) {
			this.form.markAllAsTouched();
			return;
		}

		this.isSubmitting = true;
		this.successMessage = '';
		this.errorMessage = '';

		const request = this.form.getRawValue();
		request.name = request.name.trim();
		request.email = request.email.trim();

		this.signUpService.signUp(request).subscribe({
			next: (response) => {
				this.successMessage =
					response?.message || 'Votre compte a été créé avec succès.';
				this.form.reset();
				this.isSubmitting = false;
			},
			error: () => {
				this.errorMessage =
					"L'inscription a échoué. Vérifiez votre connexion et réessayez.";
				this.isSubmitting = false;
			},
		});
	}
}
