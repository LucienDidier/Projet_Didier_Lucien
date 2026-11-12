import { TestBed } from '@angular/core/testing';
import { PollutionRecap, PollutionReport } from './pollution-recap';

describe('PollutionRecap', () => {
	it('shows the danger score and its highlighted status', () => {
		TestBed.configureTestingModule({ imports: [PollutionRecap] });
		const fixture = TestBed.createComponent(PollutionRecap);
		const report: PollutionReport = {
			title: 'Déchets près de la rivière',
			type: 'Plastique',
			description: 'Des déchets sont accumulés près de la rivière.',
			observedAt: '2026-06-12',
			dangerLevel: 51,
			location: 'Paris',
			latitude: 48.85,
			longitude: 2.35,
			photoUrl: '',
		};
		fixture.componentRef.setInput('report', report);
		fixture.detectChanges();

		const element = fixture.nativeElement as HTMLElement;
		const status = element.querySelector<HTMLElement>('.pollution-status');
		expect(element.textContent).toContain('51');
		expect(status?.textContent?.trim()).toBe('Élevée');
		expect(status?.style.backgroundColor).toBe('rgb(255, 152, 0)');
	});
});
