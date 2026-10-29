import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { SignUpService } from './sign-up.service';
import { SignUp } from './sign-up';

describe('SignUp', () => {
	const signUpService = {
		signUp: vi.fn(() => of({})),
	};

	beforeEach(async () => {
		signUpService.signUp.mockClear();
		await TestBed.configureTestingModule({
			imports: [SignUp],
			providers: [{ provide: SignUpService, useValue: signUpService }],
		}).compileComponents();
	});

	it('rejects digits in a person name and weak passwords', () => {
		const fixture = TestBed.createComponent(SignUp);
		fixture.detectChanges();
		const element = fixture.nativeElement as HTMLElement;

		const name = element.querySelector<HTMLInputElement>('#name')!;
		name.value = 'Lucie2';
		name.dispatchEvent(new Event('input'));

		const email = element.querySelector<HTMLInputElement>('#email')!;
		email.value = 'lucie@example.com';
		email.dispatchEvent(new Event('input'));

		const password = element.querySelector<HTMLInputElement>('#password')!;
		password.value = 'weakpassword';
		password.dispatchEvent(new Event('input'));

		element.querySelector('form')!.dispatchEvent(new Event('submit'));
		fixture.detectChanges();

		expect(element.textContent).toContain('sans chiffres');
		expect(element.textContent).toContain('caractère spécial');
		expect(signUpService.signUp).not.toHaveBeenCalled();
	});

	it('trims the name and email before calling the service', () => {
		const fixture = TestBed.createComponent(SignUp);
		fixture.detectChanges();
		const element = fixture.nativeElement as HTMLElement;

		const name = element.querySelector<HTMLInputElement>('#name')!;
		name.value = '  Lucie Didier  ';
		name.dispatchEvent(new Event('input'));

		const email = element.querySelector<HTMLInputElement>('#email')!;
		email.value = '  lucie@example.com  ';
		email.dispatchEvent(new Event('input'));

		const password = element.querySelector<HTMLInputElement>('#password')!;
		password.value = 'StrongPass1!';
		password.dispatchEvent(new Event('input'));

		element.querySelector('form')!.dispatchEvent(new Event('submit'));
		fixture.detectChanges();

		expect(signUpService.signUp).toHaveBeenCalledWith({
			name: 'Lucie Didier',
			email: 'lucie@example.com',
			password: 'StrongPass1!',
		});
		expect(element.textContent).toContain('compte a été créé');
	});
});
