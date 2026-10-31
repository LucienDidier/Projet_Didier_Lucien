import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { UserService } from './user.service';
import { SignUp } from './sign-up';

describe('SignUp', () => {
	const userService = {
		create: vi.fn(() => of({})),
		getAll: vi.fn(() => of([])),
	};

	beforeEach(async () => {
		userService.create.mockClear();
		userService.getAll.mockClear();
		await TestBed.configureTestingModule({
			imports: [SignUp],
			providers: [{ provide: UserService, useValue: userService }],
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
		expect(userService.create).not.toHaveBeenCalled();
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

		expect(userService.create).toHaveBeenCalledWith({
			name: 'Lucie Didier',
			email: 'lucie@example.com',
			password: 'StrongPass1!',
		});
		expect(userService.getAll).toHaveBeenCalled();
		expect(element.textContent).toContain('compte a été créé');
	});
});
