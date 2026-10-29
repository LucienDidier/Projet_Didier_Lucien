import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { lastValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';
import { PollutionReport } from '../pollution-recap/pollution-recap';
import { PollutionService, POLLUTION_STORAGE_MODE } from './pollution.service';

describe('PollutionService', () => {
	let service: PollutionService;
	let httpTestingController: HttpTestingController;

	beforeEach(() => {
		TestBed.configureTestingModule({
			providers: [
				provideHttpClient(),
				provideHttpClientTesting(),
				{ provide: POLLUTION_STORAGE_MODE, useValue: 'local' },
			],
		});
		localStorage.clear();
	});

	afterEach(() => {
		TestBed.inject(HttpTestingController).verify();
		localStorage.clear();
	});

	it('exposes all CRUD operations on the configured pollutions endpoint', () => {
		TestBed.overrideProvider(POLLUTION_STORAGE_MODE, { useValue: 'api' });
		service = TestBed.inject(PollutionService);
		httpTestingController = TestBed.inject(HttpTestingController);
		const url = `${environment.apiUrl}/pollutions`;
		const pollution: PollutionReport = {
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

	it('persists and updates pollution reports in local storage', async () => {
		service = TestBed.inject(PollutionService);
		const pollution: PollutionReport = {
			title: 'Déchets près de la rivière',
			type: 'Plastique',
			description: 'Des déchets sont accumulés près de la rivière.',
			observedAt: '2026-06-12',
			location: 'Paris',
			latitude: 48.85,
			longitude: 2.35,
			photoUrl: '',
		};

		const created = await lastValueFrom(service.create(pollution));
		expect(created.id).toBe(1);
		expect(await lastValueFrom(service.getAll())).toEqual([created]);
		expect(await lastValueFrom(service.getById(created.id))).toEqual(created);

		const updatedReport = { ...pollution, title: 'Déchets nettoyés' };
		const updated = await lastValueFrom(service.update(created.id, updatedReport));
		expect(updated).toEqual({ ...updatedReport, id: created.id });
		expect(await lastValueFrom(service.getAll())).toEqual([updated]);

		await lastValueFrom(service.delete(created.id));
		expect(await lastValueFrom(service.getAll())).toEqual([]);
	});
});
