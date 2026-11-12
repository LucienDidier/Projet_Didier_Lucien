export const POLLUTION_TYPES = [
	'Plastique',
	'Chimique',
	'Dépôt sauvage',
	'Eau',
	'Air',
	'Autre',
] as const;

export type PollutionType = (typeof POLLUTION_TYPES)[number];

export function isPollutionType(value: unknown): value is PollutionType {
	return typeof value === 'string' &&
		POLLUTION_TYPES.some((pollutionType) => pollutionType === value);
}
