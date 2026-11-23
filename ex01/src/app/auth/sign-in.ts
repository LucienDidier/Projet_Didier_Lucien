import { Component, inject } from '@angular/core';
import {
	FormControl,
	FormGroup,
	ReactiveFormsModule,
	Validators,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from './auth.service';

@Component({
	imports: [ReactiveFormsModule, RouterLink],
	selector: 'app-sign-in',
	templateUrl: './sign-in.html',
	styleUrl: '../sign-up/sign-up.scss',
})
export class SignIn {
	private readonly auth = inject(AuthService);
	private readonly route = inject(ActivatedRoute);
	private readonly router = inject(Router);

	protected readonly form = new FormGroup({
		email: new FormControl('', {
			nonNullable: true,
			validators: [Validators.required, Validators.email, Validators.maxLength(254)],
		}),
		password: new FormControl('', {
			nonNullable: true,
			validators: [Validators.required, Validators.maxLength(128)],
		}),
	});

	protected isSubmitting = false;
	protected errorMessage = '';

	protected submit(): void {
		if (this.form.invalid || this.isSubmitting) {
			this.form.markAllAsTouched();
			return;
		}

		this.isSubmitting = true;
		this.errorMessage = '';
		this.auth.login(this.form.getRawValue()).subscribe({
			next: ({ token }) => {
				this.auth.setToken(token);
				this.isSubmitting = false;
				void this.router.navigateByUrl(this.returnUrl);
			},
			error: () => {
				this.errorMessage = 'Connexion impossible. Vérifiez vos identifiants et réessayez.';
				this.isSubmitting = false;
			},
		});
	}

	private get returnUrl(): string {
		const requestedUrl = this.route.snapshot.queryParamMap.get('returnUrl');
		return requestedUrl?.startsWith('/') && !requestedUrl.startsWith('//')
			? requestedUrl
			: '/pollutions';
	}
}
