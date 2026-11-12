import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { CreateUserRequest, CreatedUser, User } from './user';

@Injectable({ providedIn: 'root' })
export class UserService {
	private readonly http = inject(HttpClient);
	private readonly usersUrl = `${environment.apiUrl}/users`;

	getAll(): Observable<User[]> {
		return this.http.get<User[]>(this.usersUrl);
	}

	create(request: CreateUserRequest): Observable<CreatedUser> {
		return this.http.post<CreatedUser>(this.usersUrl, request);
	}
}
