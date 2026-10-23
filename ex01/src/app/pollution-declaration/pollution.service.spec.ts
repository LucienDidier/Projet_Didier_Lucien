import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '../../environments/environment';
import { PollutionService } from './pollution.service';

describe('PollutionService', () => {
	let service: PollutionService;
	let httpTestingController: HttpTestingController;

	beforeEach(() => {
		TestBed.configureTestingModule({
			providers: [provideHttpClient(), provideHttpClientTesting()],
		});
		service = TestBed.inject(PollutionService);
		httpTestingController = TestBed.inject(HttpTestingController);
	});

	afterEach(() => {
		httpTestingController.verify();
	});

	it('exposes all CRUD operations on the configured pollutions endpoint', () => {
		const url = `${environment.apiUrl}/pollutions`;
		const pollution = {
			title: 'Déchets près de la rivière',
			type: 'Plastique',
			description: 'Des déchets sont accumulés près de la rivière.',
			observedAt: '2026-06-12',
			location: 'Paris',
			latitude: 48.85,
			longitude: 2.35,
			photoUrl: '',
		};

		service.getAll().subscribe();
		const listRequest = httpTestingController.expectOne(url);
		expect(listRequest.request.method).toBe('GET');
		listRequest.flush([]);

		service.getById('pollution/1').subscribe();
		const detailRequest = httpTestingController.expectOne(`${url}/pollution%2F1`);
		expect(detailRequest.request.method).toBe('GET');
		detailRequest.flush({ ...pollution, id: 'pollution/1' });

		service.create(pollution).subscribe();
		const createRequest = httpTestingController.expectOne(url);
		expect(createRequest.request.method).toBe('POST');
		expect(createRequest.request.body).toEqual(pollution);
		createRequest.flush({ ...pollution, id: 1 });

		service.update('pollution/1', pollution).subscribe();
		const updateRequest = httpTestingController.expectOne(`${url}/pollution%2F1`);
		expect(updateRequest.request.method).toBe('PUT');
		expect(updateRequest.request.body).toEqual(pollution);
		updateRequest.flush({ ...pollution, id: 'pollution/1' });

		service.delete('pollution/1').subscribe();
		const deleteRequest = httpTestingController.expectOne(`${url}/pollution%2F1`);
		expect(deleteRequest.request.method).toBe('DELETE');
		deleteRequest.flush(null);
	});
});
