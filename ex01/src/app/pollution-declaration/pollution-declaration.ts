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

const pollutionTypes = ['Plastique', 'Chimique', 'Dépôt sauvage', 'Eau', 'Air', 'Autre'] as const;
type PollutionType = (typeof pollutionTypes)[number];

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

function localDateString(date: Date): string {
	return [
		date.getFullYear(),
		String(date.getMonth() + 1).padStart(2, '0'),
		String(date.getDate()).padStart(2, '0'),
	].join('-');
}

function validDate(control: AbstractControl): ValidationErrors | null {
	const value = control.value as string;
	if (!value) {
		return null;
	}

	const date = new Date(`${value}T00:00:00Z`);
	if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value) {
		return { invalidDate: true };
	}

	return value <= localDateString(new Date()) ? null : { futureDate: true };
}

function notBlank(control: AbstractControl<string>): ValidationErrors | null {
	return control.value.trim().length > 0 ? null : { blank: true };
}

function minTrimmedLength(minimum: number) {
	return (control: AbstractControl<string>): ValidationErrors | null => {
		const actualLength = control.value.trim().length;
		return actualLength >= minimum
			? null
			: { minlength: { requiredLength: minimum, actualLength } };
	};
}

function containsLetter(control: AbstractControl<string>): ValidationErrors | null {
	return /\p{L}/u.test(control.value) ? null : { missingLetter: true };
}

function validPollutionType(control: AbstractControl): ValidationErrors | null {
	return typeof control.value === 'string' &&
		pollutionTypes.some((type) => type === control.value)
		? null
		: { invalidType: true };
}

function validCoordinate(control: AbstractControl<number | null>): ValidationErrors | null {
	return typeof control.value === 'number' && Number.isFinite(control.value)
		? null
		: { invalidNumber: true };
}

function validPhotoUrl(control: AbstractControl<string>): ValidationErrors | null {
	const value = control.value;
	if (!value) {
		return null;
	}

	if (value.length > 2048 || value !== value.trim() || /\s/.test(value)) {
		return { invalidUrl: true };
	}

	try {
		const url = new URL(value);
		return (url.protocol === 'http:' || url.protocol === 'https:') &&
			url.hostname &&
			!url.username &&
			!url.password
			? null
			: { invalidUrl: true };
	} catch {
		return { invalidUrl: true };
	}
}

@Component({
	imports: [ReactiveFormsModule, PollutionRecap],
	selector: 'app-pollution-declaration',
	styleUrl: './pollution-declaration.scss',
	templateUrl: './pollution-declaration.html',
})
export class PollutionDeclaration {
	protected readonly today = localDateString(new Date());

	protected readonly pollutionTypes = pollutionTypes;

	protected readonly form: DeclarationForm = new FormGroup({
		title: new FormControl('', {
			nonNullable: true,
			validators: [
				Validators.required,
				notBlank,
				minTrimmedLength(5),
				Validators.maxLength(120),
				Validators.pattern(/^[\p{L}\p{M}\p{N}\s.,;:!?'"’‘()\-–—/#&+]+$/u),
			],
		}),
		type: new FormControl<PollutionType | ''>('', {
			nonNullable: true,
			validators: [Validators.required, validPollutionType],
		}),
		description: new FormControl('', {
			nonNullable: true,
			validators: [
				Validators.required,
				notBlank,
				minTrimmedLength(20),
				Validators.maxLength(2000),
			],
		}),
		observedAt: new FormControl('', {
			nonNullable: true,
			validators: [Validators.required, validDate],
		}),
		location: new FormControl('', {
			nonNullable: true,
			validators: [
				Validators.required,
				notBlank,
				minTrimmedLength(3),
				Validators.maxLength(200),
				Validators.pattern(/^[\p{L}\p{M}\p{N}\s.,;:'’()/#\-]+$/u),
				containsLetter,
			],
		}),
		latitude: new FormControl<number | null>(null, [
			Validators.required,
			validCoordinate,
			Validators.min(-90),
			Validators.max(90),
		]),
		longitude: new FormControl<number | null>(null, [
			Validators.required,
			validCoordinate,
			Validators.min(-180),
			Validators.max(180),
		]),
		photoUrl: new FormControl('', {
			nonNullable: true,
			validators: [Validators.maxLength(2048), validPhotoUrl],
		}),
	});

	protected report: PollutionReport | null = null;

	protected submit(): void {
		if (this.form.invalid) {
			this.form.markAllAsTouched();
			return;
		}

		const value = this.form.getRawValue();
		value.title = value.title.trim();
		value.description = value.description.trim();
		value.location = value.location.trim();
		this.report = {
			...value,
			type: value.type as PollutionType,
			latitude: value.latitude as number,
			longitude: value.longitude as number,
		};
	}
}