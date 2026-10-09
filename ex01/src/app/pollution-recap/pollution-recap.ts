import { Component, Input } from '@angular/core';

export interface PollutionReport {
	title: string;
	type: string;
	description: string;
	observedAt: string;
	location: string;
	latitude: number;
	longitude: number;
	photoUrl: string;
}

@Component({
	selector: 'app-pollution-recap',
	styleUrl: './pollution-recap.scss',
	templateUrl: './pollution-recap.html',
})
export class PollutionRecap {
	@Input({ required: true }) report!: PollutionReport;
}