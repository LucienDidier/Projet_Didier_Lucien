import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '../../environments/environment';
import { PollutionReport } from '../pollution-recap/pollution-recap';
import { PollutionService } from './pollution.service';

describe('PollutionService', () => {
	let service: PollutionService;
	let httpTestingController: HttpTestingController;

	beforeEach(() => {
		TestBed.configureTestingModule({
			providers: [
				provideHttpClient(),
				provideHttpClientTesting(),
			],
		});
	});

	afterEach(() => {
		TestBed.inject(HttpTestingController).verify();
	});

	it('exposes all CRUD operations on the configured pollutions endpoint', () => {
		service = TestBed.inject(PollutionService);
		httpTestingController = TestBed.inject(HttpTestingController);
		const url = `${environment.apiUrl}/pollutions`;
		const pollution: PollutionReport = {
			title: 'Déchets près de la rivière',
			type: 'Plastique',
			description: 'Des déchets sont accumulés près de la rivière.',
			observedAt: '2026-06-12',
			dangerLevel: 42,
			location: 'Paris',
			latitude: 48.85,
			longitude: 2.35,
			photoUrl: '',
		};

		service.getAll().subscribe();
		const listRequest = httpTestingController.expectOne(url);
		expect(listRequest.request.method).toBe('GET');
		listRequest.flush([]);

		service.getById(1).subscribe();
		const detailRequest = httpTestingController.expectOne(`${url}/1`);
		expect(detailRequest.request.method).toBe('GET');
		detailRequest.flush({ ...pollution, id: 1 });

		service.create(pollution).subscribe();
		const createRequest = httpTestingController.expectOne(url);
		expect(createRequest.request.method).toBe('POST');
		expect(createRequest.request.body).toEqual(pollution);
		createRequest.flush({ ...pollution, id: 1 });

		service.update(1, pollution).subscribe();
		const updateRequest = httpTestingController.expectOne(`${url}/1`);
		expect(updateRequest.request.method).toBe('PUT');
		expect(updateRequest.request.body).toEqual(pollution);
		updateRequest.flush({ ...pollution, id: 1 });

		service.delete(1).subscribe();
		const deleteRequest = httpTestingController.expectOne(`${url}/1`);
		expect(deleteRequest.request.method).toBe('DELETE');
		deleteRequest.flush(null);
	});

});
