import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { vi } from 'vitest';
import { RegisterComponent } from './register';
import { environment } from 'environments/environment';

describe('RegisterComponent', () => {
  let component: RegisterComponent;
  let httpMock: HttpTestingController;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegisterComponent],
      providers: [
        provideRouter([{ path: '**', redirectTo: '' }]),
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    }).compileComponents();

    const fixture = TestBed.createComponent(RegisterComponent);
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
    component.register();
    expect(component.errorMessage).toBe('Por favor completa todos los campos.');
  });

  it('debe mostrar error si las contrasenas no coinciden', () => {
    component.nombre = 'Test';
    component.correo = 'test@test.com';
    component.password = 'password123';
    component.confirmPassword = 'password456';
    component.register();
    expect(component.errorMessage).toBe('Las contraseñas no coinciden.');
  });

  it('debe mostrar error si la contrasena es muy corta', () => {
    component.nombre = 'Test';
    component.correo = 'test@test.com';
    component.password = '123';
    component.confirmPassword = '123';
    component.register();
    expect(component.errorMessage).toBe('La contraseña debe tener mínimo 6 caracteres.');
  });

  it('debe activar isLoading al enviar el formulario', () => {
    component.nombre = 'Test';
    component.correo = 'test@test.com';
    component.password = 'password123';
    component.confirmPassword = 'password123';
    component.register();
    expect(component.isLoading).toBe(true);
    httpMock.expectOne(`${environment.apiUrl}/auth/register`).flush({
      token: 'fake-token', rol: 'cliente', nombre: 'Test', idUsuario: 1
    });
  });

  it('debe guardar token en localStorage al registrarse exitosamente', () => {
    component.nombre = 'Test';
    component.correo = 'test@test.com';
    component.password = 'password123';
    component.confirmPassword = 'password123';
    component.register();
    httpMock.expectOne(`${environment.apiUrl}/auth/register`).flush({
      token: 'fake-token', rol: 'cliente', nombre: 'Test', idUsuario: 1
    });
    expect(localStorage.getItem('token')).toBe('fake-token');
    expect(localStorage.getItem('rol')).toBe('cliente');
  });

  it('debe navegar al dashboard cliente al registrarse exitosamente', () => {
    const spy = vi.spyOn(router, 'navigate').mockResolvedValue(true);
    component.nombre = 'Test';
    component.correo = 'test@test.com';
    component.password = 'password123';
    component.confirmPassword = 'password123';
    component.register();
    httpMock.expectOne(`${environment.apiUrl}/auth/register`).flush({
      token: 'fake-token', rol: 'cliente', nombre: 'Test', idUsuario: 1
    });
    expect(spy).toHaveBeenCalledWith(['/dashboard/cliente']);
  });

  it('debe mostrar error al fallar el registro', () => {
    component.nombre = 'Test';
    component.correo = 'test@test.com';
    component.password = 'password123';
    component.confirmPassword = 'password123';
    component.register();
    httpMock.expectOne(`${environment.apiUrl}/auth/register`).flush(
      { error: 'El correo ya está registrado' },
      { status: 400, statusText: 'Bad Request' }
    );
    expect(component.errorMessage).toBe('El correo ya está registrado');
    expect(component.isLoading).toBe(false);
  });

  it('debe navegar al login al llamar irAlLogin', () => {
    const spy = vi.spyOn(router, 'navigate').mockResolvedValue(true);
    component.irAlLogin();
    expect(spy).toHaveBeenCalledWith(['/login']);
  });
});
