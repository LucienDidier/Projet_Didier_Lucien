import {
	AbstractControl,
	FormControl,
	ValidationErrors,
	ValidatorFn,
	Validators,
} from '@angular/forms';

const PERSON_NAME_PATTERN = /^[\p{L}\p{M}]+(?:[ '\u2019-][\p{L}\p{M}]+)*$/u;
const DATE_PART_WIDTH = 2;
const ISO_DATE_LENGTH = 10;
const MONTH_INDEX_OFFSET = 1;

export function notBlank(control: AbstractControl<string>): ValidationErrors | null {
	return control.value.trim().length > 0 ? null : { blank: true };
}

export function minTrimmedLength(minimum: number): ValidatorFn {
	return (control: AbstractControl): ValidationErrors | null => {
		const value = typeof control.value === 'string' ? control.value : '';
		const actualLength = value.trim().length;
		return actualLength >= minimum
			? null
			: { minlength: { requiredLength: minimum, actualLength } };
	};
}

export function containsLetter(control: AbstractControl<string>): ValidationErrors | null {
	return /\p{L}/u.test(control.value) ? null : { missingLetter: true };
}

export function validPersonName(control: AbstractControl<string>): ValidationErrors | null {
	return Validators.pattern(PERSON_NAME_PATTERN)(
		new FormControl(control.value.trim()),
	);
}

export function validEmail(control: AbstractControl<string>): ValidationErrors | null {
	return Validators.email(new FormControl(control.value.trim()));
}

export function localDateString(date: Date): string {
	return [
		date.getFullYear(),
		String(date.getMonth() + MONTH_INDEX_OFFSET).padStart(DATE_PART_WIDTH, '0'),
		String(date.getDate()).padStart(DATE_PART_WIDTH, '0'),
	].join('-');
}

export function validDateNotInFuture(control: AbstractControl<string>): ValidationErrors | null {
	const value = control.value;
	if (!value) {
		return null;
	}

	const date = new Date(`${value}T00:00:00Z`);
	if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, ISO_DATE_LENGTH) !== value) {
		return { invalidDate: true };
	}

	return value <= localDateString(new Date()) ? null : { futureDate: true };
}

export function oneOf(values: readonly string[]): ValidatorFn {
	return (control: AbstractControl): ValidationErrors | null =>
		typeof control.value === 'string' && values.includes(control.value)
			? null
			: { invalidOption: true };
}

export function finiteNumber(control: AbstractControl<number | null>): ValidationErrors | null {
	return typeof control.value === 'number' && Number.isFinite(control.value)
		? null
		: { invalidNumber: true };
}

export function validHttpUrl(control: AbstractControl<string>): ValidationErrors | null {
	const value = control.value;
	if (!value) {
		return null;
	}

	if (value !== value.trim() || /\s/.test(value)) {
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
