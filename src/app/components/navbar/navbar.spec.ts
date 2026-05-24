import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { vi } from 'vitest';
import { Navbar } from './navbar';

describe('Navbar', () => {
  let component: Navbar;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Navbar],
      providers: [
        provideRouter([{ path: '**', redirectTo: '' }])
      ]
    }).compileComponents();

    const fixture = TestBed.createComponent(Navbar);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('debe leer nombre y rol desde localStorage en ngOnInit', () => {
    localStorage.setItem('nombre', 'Admin Test');
    localStorage.setItem('rol', 'administrador');
    component.ngOnInit();
    expect(component.nombre).toBe('Admin Test');
    expect(component.rol).toBe('administrador');
  });

  it('debe asignar esAdmin true cuando rol es administrador', () => {
    localStorage.setItem('rol', 'administrador');
    component.ngOnInit();
    expect(component.esAdmin).toBe(true);
    expect(component.esRecepcionista).toBe(false);
    expect(component.esTerapeuta).toBe(false);
    expect(component.esCliente).toBe(false);
  });

  it('debe asignar esRecepcionista true cuando rol es recepcionista', () => {
    localStorage.setItem('rol', 'recepcionista');
    component.ngOnInit();
    expect(component.esRecepcionista).toBe(true);
    expect(component.esAdmin).toBe(false);
  });

  it('debe asignar esTerapeuta true cuando rol es terapeuta', () => {
    localStorage.setItem('rol', 'terapeuta');
    component.ngOnInit();
    expect(component.esTerapeuta).toBe(true);
    expect(component.esAdmin).toBe(false);
  });

  it('debe asignar esCliente true cuando rol es cliente', () => {
    localStorage.setItem('rol', 'cliente');
    component.ngOnInit();
    expect(component.esCliente).toBe(true);
    expect(component.esAdmin).toBe(false);
  });

  it('debe usar Usuario como nombre por defecto si no hay nombre en localStorage', () => {
    component.ngOnInit();
    expect(component.nombre).toBe('Usuario');
  });

  it('getDashboardHome debe retornar ruta correcta para administrador', () => {
    localStorage.setItem('rol', 'administrador');
    component.ngOnInit();
    expect(component.getDashboardHome()).toBe('/dashboard/admin');
  });

  it('getDashboardHome debe retornar ruta correcta para recepcionista', () => {
    localStorage.setItem('rol', 'recepcionista');
    component.ngOnInit();
    expect(component.getDashboardHome()).toBe('/dashboard/recepcionista');
  });

  it('getDashboardHome debe retornar ruta correcta para terapeuta', () => {
    localStorage.setItem('rol', 'terapeuta');
    component.ngOnInit();
    expect(component.getDashboardHome()).toBe('/dashboard/terapeuta');
  });

  it('getDashboardHome debe retornar ruta correcta para cliente', () => {
    localStorage.setItem('rol', 'cliente');
    component.ngOnInit();
    expect(component.getDashboardHome()).toBe('/dashboard/cliente');
  });

  it('getDashboardHome debe retornar login si no hay rol', () => {
    component.ngOnInit();
    expect(component.getDashboardHome()).toBe('/login');
  });

  it('cerrarSesion debe limpiar localStorage y navegar al login', () => {
    const spy = vi.spyOn(router, 'navigate').mockResolvedValue(true);
    localStorage.setItem('token', 'fake-token');
    localStorage.setItem('rol', 'administrador');
    component.cerrarSesion();
    expect(localStorage.getItem('token')).toBeNull();
    expect(spy).toHaveBeenCalledWith(['/login']);
  });
});