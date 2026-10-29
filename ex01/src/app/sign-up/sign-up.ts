import { Component, inject } from '@angular/core';
import {
	FormControl,
	FormGroup,
	ReactiveFormsModule,
	Validators,
} from '@angular/forms';
import { ErrorField } from '../shared/error-field/error-field';
import { minTrimmedLength, notBlank, validEmail, validPersonName } from '../validators';
import { SignUpService } from './sign-up.service';

const STRONG_PASSWORD_PATTERN = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\da-zA-Z\s]).+$/;

const SIGN_UP_ERROR_MESSAGES = {
	name: {
		required: 'Le nom est requis.',
		blank: 'Le nom ne peut pas contenir uniquement des espaces.',
		minlength: 'Le nom doit contenir au moins 2 caractères.',
		maxlength: 'Le nom ne peut pas dépasser 80 caractères.',
		pattern: 'Utilisez des lettres, espaces, apostrophes ou traits d’union, sans chiffres.',
	},
	email: {
		required: 'L’adresse e-mail est requise.',
		blank: 'L’adresse e-mail ne peut pas contenir uniquement des espaces.',
		maxlength: 'L’adresse e-mail ne peut pas dépasser 254 caractères.',
		email: 'Saisissez une adresse e-mail valide.',
	},
	password: {
		required: 'Le mot de passe est requis.',
		minlength: 'Le mot de passe doit contenir au moins 8 caractères.',
		maxlength: 'Le mot de passe ne peut pas dépasser 128 caractères.',
		pattern: 'Ajoutez une minuscule, une majuscule, un chiffre et un caractère spécial.',
	},
} as const;

type SignUpForm = FormGroup<{
	name: FormControl<string>;
	email: FormControl<string>;
	password: FormControl<string>;
}>;

@Component({
	imports: [ErrorField, ReactiveFormsModule],
	selector: 'app-sign-up',
	styleUrl: './sign-up.scss',
	templateUrl: './sign-up.html',
})
export class SignUp {
	private readonly signUpService = inject(SignUpService);

	protected readonly errorMessages = SIGN_UP_ERROR_MESSAGES;

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
				Validators.pattern(STRONG_PASSWORD_PATTERN),
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
