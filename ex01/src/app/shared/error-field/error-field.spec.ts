import { FormControl, Validators } from '@angular/forms';
import { TestBed } from '@angular/core/testing';
import { ErrorField } from './error-field';

describe('ErrorField', () => {
	it('shows the first configured error after the control is touched', async () => {
		await TestBed.configureTestingModule({
			imports: [ErrorField],
		}).compileComponents();

		const fixture = TestBed.createComponent(ErrorField);
		const control = new FormControl('', Validators.required);
		fixture.componentRef.setInput('control', control);
		fixture.componentRef.setInput('messages', { required: 'This field is required.' });
		fixture.detectChanges();

		control.markAsTouched();
		fixture.detectChanges();

		expect(fixture.nativeElement.textContent).toContain('This field is required.');
	});
});
