import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { HighlightPollutionDirective } from './highlight-pollution.directive';
import type { PollutionLevelStatus } from './pollution-level.pipe';

@Component({
	imports: [HighlightPollutionDirective],
	template: '<span [appHighlightPollution]="status"></span>',
})
class TestHost {
	status: PollutionLevelStatus | 'Inconnue' = 'Faible';
}

describe('HighlightPollutionDirective', () => {
	it.each([
		['Faible', 'rgb(200, 230, 201)'],
		['Modérée', 'rgb(255, 235, 59)'],
		['Élevée', 'rgb(255, 152, 0)'],
		['Dangereuse', 'rgb(244, 67, 54)'],
	] as const)('uses the %s background', (status, color) => {
		TestBed.configureTestingModule({ imports: [TestHost] });
		const fixture = TestBed.createComponent(TestHost);
		fixture.componentInstance.status = status;
		fixture.detectChanges();

		const element = fixture.nativeElement.querySelector('span') as HTMLSpanElement;
		expect(element.style.backgroundColor).toBe(color);
	});
});
