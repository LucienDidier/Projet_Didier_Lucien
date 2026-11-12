import { Component, Input } from '@angular/core';
import { HighlightPollutionDirective } from '../shared/highlight-pollution.directive';
import { PollutionLevelPipe } from '../shared/pollution-level.pipe';
import { PollutionType } from '../pollution-type';

export interface PollutionReport {
	title: string;
	type: PollutionType;
	description: string;
	observedAt: string;
	dangerLevel: number;
	location: string;
	latitude: number;
	longitude: number;
	photoUrl: string;
}

@Component({
	imports: [HighlightPollutionDirective, PollutionLevelPipe],
	selector: 'app-pollution-recap',
	styleUrl: './pollution-recap.scss',
	templateUrl: './pollution-recap.html',
})
export class PollutionRecap {
	@Input({ required: true }) report!: PollutionReport;
}