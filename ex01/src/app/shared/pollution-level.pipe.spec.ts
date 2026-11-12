import { PollutionLevelPipe } from './pollution-level.pipe';

describe('PollutionLevelPipe', () => {
	const pipe = new PollutionLevelPipe();

	it.each([
		[0, 'Faible'],
		[20, 'Faible'],
		[21, 'Modérée'],
		[50, 'Modérée'],
		[51, 'Élevée'],
		[100, 'Élevée'],
		[101, 'Dangereuse'],
	] as const)('maps a score of %i to %s', (score, expectedStatus) => {
		expect(pipe.transform(score)).toBe(expectedStatus);
	});

	it('marks negative or non-finite scores as unknown', () => {
		expect(pipe.transform(-1)).toBe('Inconnue');
		expect(pipe.transform(Number.NaN)).toBe('Inconnue');
	});
});
