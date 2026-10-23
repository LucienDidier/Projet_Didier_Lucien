import { Component, inject, OnInit } from '@angular/core';
import {
	AbstractControl,
	FormControl,
	FormGroup,
	ReactiveFormsModule,
	ValidationErrors,
	Validators,
} from '@angular/forms';
import { PollutionRecap, PollutionReport } from '../pollution-recap/pollution-recap';
import { Pollution, PollutionService } from './pollution.service';

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
export class PollutionDeclaration implements OnInit {
	private readonly pollutionService = inject(PollutionService);

	protected readonly today = localDateString(new Date());

	protected readonly pollutionTypes = pollutionTypes;

	protected readonly filters = new FormGroup({
		type: new FormControl('', { nonNullable: true }),
		query: new FormControl('', { nonNullable: true }),
		from: new FormControl('', { nonNullable: true }),
		to: new FormControl('', { nonNullable: true }),
	});

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

	protected pollutions: Pollution[] = [];
	protected selectedPollution: Pollution | null = null;
	protected editingId: number | string | null = null;
	protected isLoading = false;
	protected isSubmitting = false;
	protected isDeleting: number | string | null = null;
	protected errorMessage = '';
	protected listErrorMessage = '';
	protected successMessage = '';
	protected listSuccessMessage = '';

	ngOnInit(): void {
		this.loadPollutions();
	}

	protected get filteredPollutions(): Pollution[] {
		const { type, query, from, to } = this.filters.getRawValue();
		const normalizedQuery = query.trim().toLocaleLowerCase();

		return this.pollutions.filter((pollution) => {
			const matchesType = !type || pollution.type === type;
			const matchesQuery =
				!normalizedQuery ||
				[pollution.title, pollution.location, pollution.description]
					.some((value) => value.toLocaleLowerCase().includes(normalizedQuery));

			return matchesType &&
				matchesQuery &&
				(!from || pollution.observedAt >= from) &&
				(!to || pollution.observedAt <= to);
		});
	}

	protected loadPollutions(): void {
		this.isLoading = true;
		this.listErrorMessage = '';
		this.pollutionService.getAll().subscribe({
			next: (pollutions) => {
				this.pollutions = pollutions;
				this.isLoading = false;
			},
			error: () => {
				this.listErrorMessage = 'Le chargement des pollutions a échoué. Réessayez.';
				this.isLoading = false;
			},
		});
	}

	protected submit(): void {
		if (this.form.invalid || this.isSubmitting) {
			this.form.markAllAsTouched();
			return;
		}

		this.isSubmitting = true;
		this.errorMessage = '';
		this.successMessage = '';
		this.listSuccessMessage = '';
		const value = this.form.getRawValue();
		value.title = value.title.trim();
		value.description = value.description.trim();
		value.location = value.location.trim();
		const report: PollutionReport = {
			...value,
			type: value.type as PollutionType,
			latitude: value.latitude as number,
			longitude: value.longitude as number,
		};

		const editingId = this.editingId;
		const save = editingId === null
			? this.pollutionService.create(report)
			: this.pollutionService.update(editingId, report);

		save.subscribe({
			next: () => {
				this.successMessage = editingId === null
					? 'La pollution a été déclarée avec succès.'
					: 'La pollution a été modifiée avec succès.';
				this.isSubmitting = false;
				this.editingId = null;
				this.form.reset();
				this.loadPollutions();
			},
			error: () => {
				this.errorMessage = editingId === null
					? 'La déclaration a échoué. Vérifiez votre connexion et réessayez.'
					: 'La modification a échoué. Vérifiez votre connexion et réessayez.';
				this.isSubmitting = false;
			},
		});
	}

	protected showDetails(pollution: Pollution): void {
		this.listErrorMessage = '';
		this.pollutionService.getById(pollution.id).subscribe({
			next: (detail) => {
				this.selectedPollution = detail;
			},
			error: () => {
				this.listErrorMessage = 'Le détail de cette pollution ne peut pas être chargé.';
			},
		});
	}

	protected edit(pollution: Pollution): void {
		if (this.isSubmitting) {
			return;
		}

		this.selectedPollution = null;
		this.editingId = pollution.id;
		this.successMessage = '';
		this.errorMessage = '';
		this.listErrorMessage = '';
		this.form.patchValue({
			title: pollution.title,
			type: pollution.type as PollutionType,
			description: pollution.description,
			observedAt: pollution.observedAt,
			location: pollution.location,
			latitude: pollution.latitude,
			longitude: pollution.longitude,
			photoUrl: pollution.photoUrl,
		});
		this.form.markAsUntouched();
		document.getElementById('title')?.focus();
	}

	protected cancelEdit(): void {
		this.editingId = null;
		this.form.reset();
		this.errorMessage = '';
	}

	protected closeDetails(): void {
		this.selectedPollution = null;
	}

	protected delete(pollution: Pollution): void {
		this.isDeleting = pollution.id;
		this.listErrorMessage = '';
		this.listSuccessMessage = '';
		this.pollutionService.delete(pollution.id).subscribe({
			next: () => {
				this.pollutions = this.pollutions.filter((item) => item.id !== pollution.id);
				if (this.selectedPollution?.id === pollution.id) {
					this.selectedPollution = null;
				}
				this.listSuccessMessage = 'La pollution a été supprimée.';
				this.isDeleting = null;
			},
			error: () => {
				this.listErrorMessage = 'La suppression a échoué. Réessayez.';
				this.isDeleting = null;
			},
		});
	}
}