import { Routes } from '@angular/router';
import { authGuard } from './auth/auth.guard';

export const appRoutes: Routes = [
	{ path: '', pathMatch: 'full', redirectTo: 'pollutions' },
	{
		path: 'connexion',
		loadComponent: () => import('./auth/sign-in').then((module) => module.SignIn),
	},
	{
		path: 'inscription',
		loadComponent: () => import('./sign-up/sign-up').then((module) => module.SignUp),
	},
	{
		path: 'pollutions',
		canActivate: [authGuard],
		loadComponent: () =>
			import('./pollution-declaration/pollution-declaration').then(
				(module) => module.PollutionDeclaration,
			),
	},
	{ path: '**', redirectTo: 'pollutions' },
];
