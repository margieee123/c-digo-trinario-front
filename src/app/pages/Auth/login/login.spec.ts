import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { vi } from 'vitest';
import { Login } from './login';
import { environment } from 'environments/environment';

describe('Login', () => {
  let component: Login;
  let httpMock: HttpTestingController;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Login],
      providers: [
        provideRouter([{ path: '**', redirectTo: '' }]),
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    }).compileComponents();

    const fixture = TestBed.createComponent(Login);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('debe mostrar error si los campos estan vacios', () => {
    component.correo = '';
    component.password = '';
    component.onLogin();
    expect(component.errorMessage).toBe('Por favor completa todos los campos.');
  });

  it('debe mostrar error si solo el correo esta vacio', () => {
    component.correo = '';
    component.password = 'password123';
    component.onLogin();
    expect(component.errorMessage).toBe('Por favor completa todos los campos.');
  });

  it('debe mostrar error si solo la password esta vacia', () => {
    component.correo = 'test@test.com';
    component.password = '';
    component.onLogin();
    expect(component.errorMessage).toBe('Por favor completa todos los campos.');
  });

  it('debe activar isLoading al enviar el formulario', () => {
    component.correo = 'test@test.com';
    component.password = 'password123';
    component.onLogin();
    expect(component.isLoading).toBe(true);
    httpMock.expectOne(`${environment.apiUrl}/auth/login`).flush({
      token: 'fake-token', rol: 'cliente', nombre: 'Test', idUsuario: 1
    });
  });

  it('debe guardar token en localStorage al login exitoso', () => {
    component.correo = 'admin@spa.com';
    component.password = 'admin123';
    component.onLogin();
    httpMock.expectOne(`${environment.apiUrl}/auth/login`).flush({
      token: 'fake-token', rol: 'administrador', nombre: 'Admin', idUsuario: 1
    });
    expect(localStorage.getItem('token')).toBe('fake-token');
    expect(localStorage.getItem('rol')).toBe('administrador');
  });

  it('debe navegar al dashboard admin segun rol', () => {
    const spy = vi.spyOn(router, 'navigate').mockResolvedValue(true);
    component.correo = 'admin@spa.com';
    component.password = 'admin123';
    component.onLogin();
    httpMock.expectOne(`${environment.apiUrl}/auth/login`).flush({
      token: 'fake-token', rol: 'administrador', nombre: 'Admin', idUsuario: 1
    });
    expect(spy).toHaveBeenCalledWith(['/dashboard/admin']);
  });

  it('debe navegar al dashboard cliente segun rol', () => {
    const spy = vi.spyOn(router, 'navigate').mockResolvedValue(true);
    component.correo = 'cliente@spa.com';
    component.password = 'password123';
    component.onLogin();
    httpMock.expectOne(`${environment.apiUrl}/auth/login`).flush({
      token: 'fake-token', rol: 'cliente', nombre: 'Cliente', idUsuario: 2
    });
    expect(spy).toHaveBeenCalledWith(['/dashboard/cliente']);
  });

  it('debe mostrar error al fallar el login', () => {
    component.correo = 'test@test.com';
    component.password = 'wrongpassword';
    component.onLogin();
    httpMock.expectOne(`${environment.apiUrl}/auth/login`).flush(
      { error: 'Credenciales incorrectas' },
      { status: 401, statusText: 'Unauthorized' }
    );
    expect(component.errorMessage).toBe('Credenciales incorrectas');
    expect(component.isLoading).toBe(false);
  });
});
