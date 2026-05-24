import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { vi } from 'vitest';
import { InicioAdmi } from './inicioadmi';

describe('InicioAdmi', () => {
  let component: InicioAdmi;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InicioAdmi],
      providers: [
        provideRouter([{ path: '**', redirectTo: '' }]),
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    }).compileComponents();

    const fixture = TestBed.createComponent(InicioAdmi);
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

  it('debe leer nombre desde localStorage en ngOnInit', () => {
    localStorage.setItem('nombre', 'Admin Test');
    localStorage.setItem('token', 'fake-token');
    component.ngOnInit();
    expect(component.nombre).toBe('Admin Test');
  });

  it('debe usar Administrador como nombre por defecto', () => {
    component.ngOnInit();
    expect(component.nombre).toBe('Administrador');
  });

  it('debe tener 4 KPI cards inicializadas', () => {
    expect(component.kpiCards.length).toBe(4);
  });

  it('debe tener 5 estados de reservas inicializados', () => {
    expect(component.estadosReservas.length).toBe(5);
  });

  it('getDonaLongitud debe retornar 0 si no hay reservas', () => {
    expect(component.getDonaLongitud(0)).toBe(0);
  });

  it('getDonaLongitud debe calcular porcentaje correctamente', () => {
    component.estadosReservas[0].count = 2;
    component.estadosReservas[1].count = 2;
    expect(component.getDonaLongitud(2)).toBe(50);
  });

  it('getDonaOffset debe retornar 0 para el primer elemento', () => {
    expect(component.getDonaOffset(0)).toBe(0);
  });

  it('getTipoLogIcon debe retornar icono correcto para LOGIN_EXITOSO', () => {
    expect(component.getTipoLogIcon('LOGIN_EXITOSO')).toBe('login');
  });

  it('getTipoLogIcon debe retornar icono correcto para LOGIN_FALLIDO', () => {
    expect(component.getTipoLogIcon('LOGIN_FALLIDO')).toBe('no_accounts');
  });

  it('getTipoLogIcon debe retornar info para tipo desconocido', () => {
    expect(component.getTipoLogIcon('DESCONOCIDO')).toBe('info');
  });

  it('getTipoLogColor debe retornar color correcto para LOGIN_EXITOSO', () => {
    expect(component.getTipoLogColor('LOGIN_EXITOSO')).toBe('#a8e6a3');
  });

  it('getTipoLogColor debe retornar color por defecto para tipo desconocido', () => {
    expect(component.getTipoLogColor('DESCONOCIDO')).toBe('#999');
  });

  it('generarBarras debe crear 7 barras', () => {
    component.generarBarras([]);
    expect(component.barData.length).toBe(7);
  });

  it('generarBarras con reservas debe asignar conteos correctamente', () => {
    const hoy = new Date();
    const dia = hoy.getDay();
    const lunes = new Date(hoy);
    lunes.setDate(hoy.getDate() - (dia === 0 ? 6 : dia - 1));
    const fechaLunes = `${lunes.getFullYear()}-${String(lunes.getMonth()+1).padStart(2,'0')}-${String(lunes.getDate()).padStart(2,'0')}`;

    const reservasMock: any[] = [
      { fecha: fechaLunes, estado: 'confirmada', totalServicios: 100000 },
      { fecha: fechaLunes, estado: 'pendiente', totalServicios: 50000 }
    ];

    component.generarBarras(reservasMock);
    expect(component.barData[0].count).toBe(2);
  });

  it('irNuevaReserva debe navegar a dashboard admin reservas', () => {
    const spy = vi.spyOn(router, 'navigate').mockResolvedValue(true);
    component.irNuevaReserva();
    expect(spy).toHaveBeenCalledWith(['/dashboard/admin/reservas']);
  });

  it('cerrarSesion debe limpiar localStorage y navegar al login', () => {
    const spy = vi.spyOn(router, 'navigate').mockResolvedValue(true);
    localStorage.setItem('token', 'fake-token');
    component.cerrarSesion();
    expect(localStorage.getItem('token')).toBeNull();
    expect(spy).toHaveBeenCalledWith(['/login']);
  });
});