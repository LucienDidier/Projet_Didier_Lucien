import { TestBed } from '@angular/core/testing';
import { PollutionDeclaration } from './pollution-declaration';

describe('PollutionDeclaration', () => {
	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [PollutionDeclaration],
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
});
