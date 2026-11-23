import { Directive, HostBinding, Input } from '@angular/core';
import type { PollutionLevelStatus } from './pollution-level.pipe';

const POLLUTION_LEVEL_COLORS: Record<PollutionLevelStatus, string> = {
	Faible: '#c8e6c9',
	Modérée: '#ffeb3b',
	Élevée: '#ff9800',
	Dangereuse: '#f44336',
};

@Directive({
	selector: '[appHighlightPollution]',
	standalone: true,
})
export class HighlightPollutionDirective {
	@Input() appHighlightPollution: PollutionLevelStatus | 'Inconnue' = 'Inconnue';

	@HostBinding('style.background-color')
	protected get backgroundColor(): string {
		return this.appHighlightPollution === 'Inconnue'
			? ''
			: POLLUTION_LEVEL_COLORS[this.appHighlightPollution];
	}
}
