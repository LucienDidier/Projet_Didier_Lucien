import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

export const authGuard: CanActivateFn = (_route, state) => {
	const auth = inject(AuthService);
	const router = inject(Router);

	return auth.isAuthenticated()
		? true
		: router.createUrlTree(['/connexion'], {
				queryParams: { returnUrl: state.url },
			});
};
