import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { App } from './app';
import { PollutionService } from './pollution-declaration/pollution.service';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        {
          provide: PollutionService,
          useValue: {
            getAll: () => of([]),
            getById: () => of({}),
            create: () => of({}),
            update: () => of({}),
            delete: () => of(undefined),
          },
        },
      ],
    })
      .compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should render the signup and pollution declaration forms', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('app-sign-up h1')?.textContent).toContain('Inscription');
    expect(compiled.querySelector('app-pollution-declaration h1')?.textContent).toContain(
      'Déclarer une pollution',
    );
  });
});
