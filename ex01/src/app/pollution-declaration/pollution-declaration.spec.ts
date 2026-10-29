import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { PollutionDeclaration } from './pollution-declaration';
import { Pollution, PollutionService } from './pollution.service';

describe('PollutionDeclaration', () => {
	const pollutionService = {
		getAll: vi.fn(() => of([] as Pollution[])),
		getById: vi.fn(),
		create: vi.fn(),
		update: vi.fn(),
		delete: vi.fn(),
	};

	beforeEach(async () => {
		pollutionService.getAll.mockClear();
		await TestBed.configureTestingModule({
			imports: [PollutionDeclaration],
			providers: [{ provide: PollutionService, useValue: pollutionService }],
		}).compileComponents();
	});

	it('rejects too-short descriptions and locations without letters', () => {
		const fixture = TestBed.createComponent(PollutionDeclaration);
		fixture.detectChanges();
		const element = fixture.nativeElement as HTMLElement;

		const title = element.querySelector<HTMLInputElement>('#title')!;
		title.value = 'Pollution avenue 12';
		title.dispatchEvent(new Event('input'));

		const type = element.querySelector<HTMLSelectElement>('#type')!;
		type.value = 'Plastique';
		type.dispatchEvent(new Event('change'));

		const date = element.querySelector<HTMLInputElement>('#observedAt')!;
		const today = new Date();
		date.value = [
			today.getFullYear(),
			String(today.getMonth() + 1).padStart(2, '0'),
			String(today.getDate()).padStart(2, '0'),
		].join('-');
		date.dispatchEvent(new Event('input'));

		const description = element.querySelector<HTMLTextAreaElement>('#description')!;
		description.value = 'Trop court';
		description.dispatchEvent(new Event('input'));

		const location = element.querySelector<HTMLInputElement>('#location')!;
		location.value = '12345';
		location.dispatchEvent(new Event('input'));

		const latitude = element.querySelector<HTMLInputElement>('#latitude')!;
		latitude.value = '48.8566';
		latitude.dispatchEvent(new Event('input'));

		const longitude = element.querySelector<HTMLInputElement>('#longitude')!;
		longitude.value = '2.3522';
		longitude.dispatchEvent(new Event('input'));

		element.querySelector('form')!.dispatchEvent(new Event('submit'));
		fixture.detectChanges();

		expect(element.textContent).toContain('au moins 20 caractères');
		expect(element.textContent).toContain('au moins une lettre');
		expect(element.querySelector('app-pollution-recap')).toBeNull();
	});

	it('loads pollutions and filters them by type and text', () => {
		pollutionService.getAll.mockReturnValue(
			of([
				{
					id: 1,
					title: 'Déchets au bord de la Seine',
					type: 'Plastique',
					description: 'Des déchets sont visibles au bord de la rivière.',
					observedAt: '2026-06-12',
					location: 'Paris',
					latitude: 48.85,
					longitude: 2.35,
					photoUrl: '',
				},
				{
					id: 2,
					title: 'Fumée près de la route',
					type: 'Air',
					description: 'Une fumée épaisse est visible près de la route.',
					observedAt: '2026-06-13',
					location: 'Lyon',
					latitude: 45.76,
					longitude: 4.83,
					photoUrl: '',
				},
			]),
		);

		const fixture = TestBed.createComponent(PollutionDeclaration);
		fixture.detectChanges();
		const element = fixture.nativeElement as HTMLElement;

		const typeFilter = element.querySelector<HTMLSelectElement>('.filters select')!;
		typeFilter.value = 'Plastique';
		typeFilter.dispatchEvent(new Event('change'));
		fixture.detectChanges();

		expect(element.querySelectorAll('.pollution-item')).toHaveLength(1);
		expect(element.textContent).toContain('Déchets au bord de la Seine');
		expect(element.textContent).not.toContain('Fumée près de la route');
	});
});
