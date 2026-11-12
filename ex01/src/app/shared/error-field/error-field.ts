import { AbstractControl } from '@angular/forms';
import {
	ChangeDetectorRef,
	Component,
	DestroyRef,
	Input,
	OnInit,
	inject,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
	selector: 'app-error-field',
	styleUrl: './error-field.scss',
	templateUrl: './error-field.html',
})
export class ErrorField implements OnInit {
	private readonly changeDetectorRef = inject(ChangeDetectorRef);
	private readonly destroyRef = inject(DestroyRef);

	@Input({ required: true }) control!: AbstractControl;
	@Input({ required: true }) messages!: Record<string, string>;

	ngOnInit(): void {
		this.control.events
			.pipe(takeUntilDestroyed(this.destroyRef))
			.subscribe(() => this.changeDetectorRef.markForCheck());
	}

	protected get message(): string | null {
		if (!this.control.touched || !this.control.errors) {
			return null;
		}

		for (const [errorName, message] of Object.entries(this.messages)) {
			if (this.control.hasError(errorName)) {
				return message;
			}
		}

		return null;
	}
}
