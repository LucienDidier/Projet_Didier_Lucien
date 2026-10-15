import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface SignUpRequest {
	name: string;
	email: string;
	password: string;
}

export interface SignUpResponse {
	message?: string;
}

@Injectable({ providedIn: 'root' })
export class SignUpService {
	private readonly http = inject(HttpClient);
	private readonly signUpUrl = `${environment.apiUrl}/auth/signup`;

	signUp(request: SignUpRequest): Observable<SignUpResponse> {
		return this.http.post<SignUpResponse>(this.signUpUrl, request);
	}
}
