import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { User } from '../sign-up/user';

export interface LoginRequest {
	email: string;
	password: string;
}

export interface AuthResponse {
	token: string;
	user: User;
}

const ACCESS_TOKEN_KEY = 'pollution-access-token';

@Injectable({ providedIn: 'root' })
export class AuthService {
	private readonly http = inject(HttpClient);
	private readonly loginUrl = `${environment.apiUrl}/auth/login`;

	login(request: LoginRequest): Observable<AuthResponse> {
		return this.http.post<AuthResponse>(this.loginUrl, request);
	}

	get token(): string | null {
		return this.readToken();
	}

	isAuthenticated(): boolean {
		const token = this.readToken();
		if (!token) {
			return false;
		}

		try {
			const payload = JSON.parse(
				atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')),
			) as { exp?: unknown };
			if (typeof payload.exp === 'number' && payload.exp * 1000 > Date.now()) {
				return true;
			}
		} catch {
			// Invalid or malformed tokens are discarded below.
		}

		this.logout();
		return false;
	}

	setToken(token: string): void {
		sessionStorage.setItem(ACCESS_TOKEN_KEY, token);
	}

	logout(): void {
		sessionStorage.removeItem(ACCESS_TOKEN_KEY);
	}

	private readToken(): string | null {
		return typeof sessionStorage === 'undefined'
			? null
			: sessionStorage.getItem(ACCESS_TOKEN_KEY);
	}
}
