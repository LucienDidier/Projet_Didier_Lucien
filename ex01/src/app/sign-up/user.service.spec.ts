import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '../../environments/environment';
import { UserService } from './user.service';

describe('UserService', () => {
	let service: UserService;
	let httpTestingController: HttpTestingController;

	beforeEach(() => {
		TestBed.configureTestingModule({
			providers: [provideHttpClient(), provideHttpClientTesting()],
		});
		service = TestBed.inject(UserService);
		httpTestingController = TestBed.inject(HttpTestingController);
	});

	afterEach(() => {
		httpTestingController.verify();
	});

	it('lists users from the API', () => {
		service.getAll().subscribe();

		const request = httpTestingController.expectOne(`${environment.apiUrl}/users`);
		expect(request.request.method).toBe('GET');
		request.flush([]);
	});

	it('creates users through the API', () => {
		const user = {
			name: 'Lucie Didier',
			email: 'lucie@example.com',
			password: 'StrongPass1!',
		};
		service.create(user).subscribe();

		const request = httpTestingController.expectOne(`${environment.apiUrl}/users`);
		expect(request.request.method).toBe('POST');
		expect(request.request.body).toEqual(user);
		request.flush({ id: 1, name: user.name, email: user.email });
	});
});
