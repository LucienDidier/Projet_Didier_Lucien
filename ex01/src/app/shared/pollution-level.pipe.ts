import { Pipe, PipeTransform } from '@angular/core';

export type PollutionLevelStatus = 'Faible' | 'Modérée' | 'Élevée' | 'Dangereuse';

@Pipe({
	name: 'pollutionLevel',
	standalone: true,
})
export class PollutionLevelPipe implements PipeTransform {
	transform(value: number): PollutionLevelStatus | 'Inconnue' {
		if (!Number.isFinite(value) || value < 0) {
			return 'Inconnue';
		}

		if (value <= 20) {
			return 'Faible';
		}
		if (value <= 50) {
			return 'Modérée';
		}
		if (value <= 100) {
			return 'Élevée';
		}
		return 'Dangereuse';
	}
}
