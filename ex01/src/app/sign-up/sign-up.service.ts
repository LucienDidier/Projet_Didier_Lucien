import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { SignUpRequest } from './models/sign-up-request';
import { SignUpResponse } from './models/sign-up-response';

@Injectable({ providedIn: 'root' })
export class SignUpService {
	private readonly http = inject(HttpClient);
	private readonly signUpUrl = `${environment.apiUrl}/auth/signup`;

	signUp(request: SignUpRequest): Observable<SignUpResponse> {
		return this.http.post<SignUpResponse>(this.signUpUrl, request);
	}
}
