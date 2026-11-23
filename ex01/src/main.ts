import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { App } from './app/app';
import { authInterceptor } from './app/auth/auth.interceptor';
import { appRoutes } from './app/app.routes';

bootstrapApplication(App, {
	providers: [
		provideHttpClient(withInterceptors([authInterceptor])),
		provideRouter(appRoutes),
	],
}).catch((error) => console.error(error));
