import { Component } from '@angular/core';
import {
	AbstractControl,
	FormControl,
	FormGroup,
	ReactiveFormsModule,
	ValidationErrors,
	Validators,
} from '@angular/forms';
import { PollutionRecap, PollutionReport } from '../pollution-recap/pollution-recap';

type PollutionType = 'Plastique' | 'Chimique' | 'Dépôt sauvage' | 'Eau' | 'Air' | 'Autre';

type DeclarationForm = FormGroup<{
	title: FormControl<string>;
	type: FormControl<PollutionType | ''>;
	description: FormControl<string>;
	observedAt: FormControl<string>;
	location: FormControl<string>;
	latitude: FormControl<number | null>;
	longitude: FormControl<number | null>;
	photoUrl: FormControl<string>;
}>;

function validDate(control: AbstractControl): ValidationErrors | null {
	const value = control.value as string;
	if (!value) {
		return null;
	}

	const date = new Date(`${value}T00:00:00Z`);
	return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value
		? null
		: { invalidDate: true };
}

@Component({
	imports: [ReactiveFormsModule, PollutionRecap],
	selector: 'app-pollution-declaration',
	styleUrl: './pollution-declaration.scss',
	templateUrl: './pollution-declaration.html',
})
export class PollutionDeclaration {
	protected readonly pollutionTypes: PollutionType[] = [
		'Plastique',
		'Chimique',
		'Dépôt sauvage',
		'Eau',
		'Air',
		'Autre',
	];

	protected readonly form: DeclarationForm = new FormGroup({
		title: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
		type: new FormControl<PollutionType | ''>('', {
			nonNullable: true,
			validators: [Validators.required],
		}),
		description: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
		observedAt: new FormControl('', {
			nonNullable: true,
			validators: [Validators.required, validDate],
		}),
		location: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
		latitude: new FormControl<number | null>(null, [
			Validators.required,
			Validators.min(-90),
			Validators.max(90),
		]),
		longitude: new FormControl<number | null>(null, [
			Validators.required,
			Validators.min(-180),
			Validators.max(180),
		]),
		photoUrl: new FormControl('', {
			nonNullable: true,
			validators: [Validators.pattern(/^https?:\/\/\S+$/i)],
		}),
	});

	protected report: PollutionReport | null = null;

	protected submit(): void {
		if (this.form.invalid) {
			this.form.markAllAsTouched();
			return;
		}

		const value = this.form.getRawValue();
		this.report = {
			...value,
			type: value.type as PollutionType,
			latitude: value.latitude as number,
			longitude: value.longitude as number,
		};
	}
}