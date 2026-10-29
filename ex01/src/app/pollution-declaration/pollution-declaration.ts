import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import {
	FormControl,
	FormGroup,
	ReactiveFormsModule,
	Validators,
} from '@angular/forms';
import { TimeoutError } from 'rxjs';
import { PollutionType, POLLUTION_TYPES, isPollutionType } from '../pollution-type';
import { PollutionRecap, PollutionReport } from '../pollution-recap/pollution-recap';
import { ErrorField } from '../shared/error-field/error-field';
import {
	containsLetter,
	finiteNumber,
	localDateString,
	minTrimmedLength,
	notBlank,
	oneOf,
	validDateNotInFuture,
	validHttpUrl,
} from '../validators';
import { Pollution, PollutionService } from './pollution.service';

const POLLUTION_DECLARATION_LIMITS = {
	title: { minLength: 5, maxLength: 120 },
	description: { minLength: 20, maxLength: 2000 },
	location: { minLength: 3, maxLength: 200 },
	photoUrl: { maxLength: 2048 },
	latitude: { minimum: -90, maximum: 90 },
	longitude: { minimum: -180, maximum: 180 },
} as const;

const DECLARATION_ERROR_MESSAGES = {
	title: {
		required: 'Le titre est requis.',
		blank: 'Le titre ne peut pas contenir uniquement des espaces.',
		minlength: `Le titre doit contenir au moins ${POLLUTION_DECLARATION_LIMITS.title.minLength} caractères.`,
		maxlength: `Le titre ne peut pas dépasser ${POLLUTION_DECLARATION_LIMITS.title.maxLength} caractères.`,
		pattern: 'Le titre contient des caractères non autorisés.',
	},
	type: {
		required: 'Sélectionnez un type de pollution.',
		invalidOption: 'Sélectionnez un type de pollution.',
	},
	observedAt: {
		required: 'La date est requise.',
		invalidDate: 'Saisissez une date valide.',
		futureDate: 'La date de l’observation ne peut pas être dans le futur.',
	},
	description: {
		required: 'La description est requise.',
		blank: 'La description ne peut pas contenir uniquement des espaces.',
		minlength: `La description doit contenir au moins ${POLLUTION_DECLARATION_LIMITS.description.minLength} caractères.`,
		maxlength: `La description ne peut pas dépasser ${POLLUTION_DECLARATION_LIMITS.description.maxLength.toLocaleString('fr-FR')} caractères.`,
	},
	location: {
		required: 'Le lieu est requis.',
		blank: 'Le lieu ne peut pas contenir uniquement des espaces.',
		minlength: `Le lieu doit contenir au moins ${POLLUTION_DECLARATION_LIMITS.location.minLength} caractères.`,
		maxlength: `Le lieu ne peut pas dépasser ${POLLUTION_DECLARATION_LIMITS.location.maxLength} caractères.`,
		pattern: 'Le lieu contient des caractères non autorisés.',
		missingLetter: 'Le lieu doit contenir au moins une lettre.',
	},
	latitude: {
		required: 'La latitude est requise.',
		invalidNumber: 'La latitude doit être un nombre valide.',
		min: `La latitude doit être comprise entre ${POLLUTION_DECLARATION_LIMITS.latitude.minimum} et ${POLLUTION_DECLARATION_LIMITS.latitude.maximum}.`,
		max: `La latitude doit être comprise entre ${POLLUTION_DECLARATION_LIMITS.latitude.minimum} et ${POLLUTION_DECLARATION_LIMITS.latitude.maximum}.`,
	},
	longitude: {
		required: 'La longitude est requise.',
		invalidNumber: 'La longitude doit être un nombre valide.',
		min: `La longitude doit être comprise entre ${POLLUTION_DECLARATION_LIMITS.longitude.minimum} et ${POLLUTION_DECLARATION_LIMITS.longitude.maximum}.`,
		max: `La longitude doit être comprise entre ${POLLUTION_DECLARATION_LIMITS.longitude.minimum} et ${POLLUTION_DECLARATION_LIMITS.longitude.maximum}.`,
	},
	photoUrl: {
		maxlength: `L’URL ne peut pas dépasser ${POLLUTION_DECLARATION_LIMITS.photoUrl.maxLength.toLocaleString('fr-FR')} caractères.`,
		invalidUrl: 'Saisissez une URL HTTP ou HTTPS valide, sans espace.',
	},
} as const;

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

@Component({
	imports: [ErrorField, PollutionRecap, ReactiveFormsModule],
	selector: 'app-pollution-declaration',
	styleUrl: './pollution-declaration.scss',
	templateUrl: './pollution-declaration.html',
})
export class PollutionDeclaration implements OnInit {
	private readonly pollutionService = inject(PollutionService);
	private readonly changeDetectorRef = inject(ChangeDetectorRef);

	protected readonly today = localDateString(new Date());

	protected readonly usesLocalStorage = this.pollutionService.usesLocalStorage;

	protected readonly limits = POLLUTION_DECLARATION_LIMITS;

	protected readonly pollutionTypes = POLLUTION_TYPES;

	protected readonly errorMessages = DECLARATION_ERROR_MESSAGES;

	protected readonly filters = new FormGroup({
		type: new FormControl<PollutionType | ''>('', { nonNullable: true }),
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
				minTrimmedLength(POLLUTION_DECLARATION_LIMITS.title.minLength),
				Validators.maxLength(POLLUTION_DECLARATION_LIMITS.title.maxLength),
				Validators.pattern(/^[\p{L}\p{M}\p{N}\s.,;:!?'"’‘()\-–—/#&+]+$/u),
			],
		}),
		type: new FormControl<PollutionType | ''>('', {
			nonNullable: true,
			validators: [Validators.required, oneOf(POLLUTION_TYPES)],
		}),
		description: new FormControl('', {
			nonNullable: true,
			validators: [
				Validators.required,
				notBlank,
				minTrimmedLength(POLLUTION_DECLARATION_LIMITS.description.minLength),
				Validators.maxLength(POLLUTION_DECLARATION_LIMITS.description.maxLength),
			],
		}),
		observedAt: new FormControl('', {
			nonNullable: true,
			validators: [Validators.required, validDateNotInFuture],
		}),
		location: new FormControl('', {
			nonNullable: true,
			validators: [
				Validators.required,
				notBlank,
				minTrimmedLength(POLLUTION_DECLARATION_LIMITS.location.minLength),
				Validators.maxLength(POLLUTION_DECLARATION_LIMITS.location.maxLength),
				Validators.pattern(/^[\p{L}\p{M}\p{N}\s.,;:'’()/#\-]+$/u),
				containsLetter,
			],
		}),
		latitude: new FormControl<number | null>(null, [
			Validators.required,
			finiteNumber,
			Validators.min(POLLUTION_DECLARATION_LIMITS.latitude.minimum),
			Validators.max(POLLUTION_DECLARATION_LIMITS.latitude.maximum),
		]),
		longitude: new FormControl<number | null>(null, [
			Validators.required,
			finiteNumber,
			Validators.min(POLLUTION_DECLARATION_LIMITS.longitude.minimum),
			Validators.max(POLLUTION_DECLARATION_LIMITS.longitude.maximum),
		]),
		photoUrl: new FormControl('', {
			nonNullable: true,
			validators: [
				Validators.maxLength(POLLUTION_DECLARATION_LIMITS.photoUrl.maxLength),
				validHttpUrl,
			],
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
				this.changeDetectorRef.markForCheck();
			},
			error: () => {
				this.listErrorMessage = 'Le chargement des pollutions a échoué. Réessayez.';
				this.isLoading = false;
				this.changeDetectorRef.markForCheck();
			},
		});
	}

	protected submit(): void {
		if (this.form.invalid || this.isSubmitting) {
			this.form.markAllAsTouched();
			return;
		}

		this.errorMessage = '';
		this.successMessage = '';
		this.listSuccessMessage = '';
		const value = this.form.getRawValue();
		const pollutionType = value.type;
		const latitude = value.latitude;
		const longitude = value.longitude;
		if (!isPollutionType(pollutionType)) {
			this.form.controls.type.setErrors({ invalidType: true });
			this.form.markAllAsTouched();
			return;
		}
		if (typeof latitude !== 'number' || !Number.isFinite(latitude)) {
			this.form.controls.latitude.setErrors({ invalidNumber: true });
			this.form.markAllAsTouched();
			return;
		}
		if (typeof longitude !== 'number' || !Number.isFinite(longitude)) {
			this.form.controls.longitude.setErrors({ invalidNumber: true });
			this.form.markAllAsTouched();
			return;
		}

		this.isSubmitting = true;
		value.title = value.title.trim();
		value.description = value.description.trim();
		value.location = value.location.trim();
		const report: PollutionReport = {
			...value,
			type: pollutionType,
			latitude,
			longitude,
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
				this.changeDetectorRef.markForCheck();
			},
			error: (error: unknown) => {
				this.errorMessage = this.isApiUnavailable(error)
					? 'API indisponible. Lancez l’application avec « npm start » pour démarrer aussi le serveur mock.'
					: editingId === null
						? 'La déclaration a échoué. Vérifiez votre connexion et réessayez.'
						: 'La modification a échoué. Vérifiez votre connexion et réessayez.';
				this.isSubmitting = false;
				this.changeDetectorRef.markForCheck();
			},
		});
	}

	protected showDetails(pollution: Pollution): void {
		this.listErrorMessage = '';
		this.pollutionService.getById(pollution.id).subscribe({
			next: (detail) => {
				this.selectedPollution = detail;
				this.changeDetectorRef.markForCheck();
			},
			error: () => {
				this.listErrorMessage = 'Le détail de cette pollution ne peut pas être chargé.';
				this.changeDetectorRef.markForCheck();
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
			type: pollution.type,
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
				this.changeDetectorRef.markForCheck();
			},
			error: () => {
				this.listErrorMessage = 'La suppression a échoué. Réessayez.';
				this.isDeleting = null;
				this.changeDetectorRef.markForCheck();
			},
		});
	}

	private isApiUnavailable(error: unknown): boolean {
		return error instanceof TimeoutError ||
			(error instanceof HttpErrorResponse && error.status === 0);
	}
}