import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { authGuard } from './auth.guard';
import { AuthService } from './auth.service';

describe('authGuard', () => {
	it('redirects anonymous users to login with the requested URL', () => {
		TestBed.configureTestingModule({
			providers: [
				provideRouter([]),
				{ provide: AuthService, useValue: { isAuthenticated: () => false } },
			],
		});

		const result = TestBed.runInInjectionContext(() =>
			authGuard({} as never, { url: '/pollutions' } as never),
		);

		expect(result).toEqual(
			TestBed.inject(Router).parseUrl('/connexion?returnUrl=%2Fpollutions'),
		);
	});

	it('allows authenticated users', () => {
		TestBed.configureTestingModule({
			providers: [
				provideRouter([]),
				{ provide: AuthService, useValue: { isAuthenticated: () => true } },
			],
		});

		const result = TestBed.runInInjectionContext(() =>
			authGuard({} as never, { url: '/pollutions' } as never),
		);

		expect(result).toBe(true);
	});
});
