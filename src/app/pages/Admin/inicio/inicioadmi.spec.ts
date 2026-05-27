import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { vi } from 'vitest';
import { InicioAdmi } from './inicioadmi';
import { environment } from 'environments/environment';

describe('InicioAdmi', () => {
  let component: InicioAdmi;
  let router: Router;
  let httpMock: HttpTestingController;

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
    httpMock = TestBed.inject(HttpTestingController);
    localStorage.clear();
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('debe leer nombre desde localStorage en ngOnInit', () => {
    localStorage.setItem('nombre', 'Admin Test');
    localStorage.setItem('token', 'fake-token');
    component.ngOnInit();
    httpMock.expectOne(req => req.url.includes('reservas/filtrar')).flush([]);
    httpMock.expectOne(`${environment.apiUrl}/usuarios`).flush([]);
    httpMock.expectOne(req => req.url.includes('reservas/filtrar')).flush([]);
    httpMock.expectOne(`${environment.apiUrl}/servicios`).flush([]);
    httpMock.expectOne(req => req.url.includes('logs')).flush([]);
    expect(component.nombre).toBe('Admin Test');
  });

  it('debe usar Administrador como nombre por defecto', () => {
    component.ngOnInit();
    httpMock.expectOne(req => req.url.includes('reservas/filtrar')).flush([]);
    httpMock.expectOne(`${environment.apiUrl}/usuarios`).flush([]);
    httpMock.expectOne(req => req.url.includes('reservas/filtrar')).flush([]);
    httpMock.expectOne(`${environment.apiUrl}/servicios`).flush([]);
    httpMock.expectOne(req => req.url.includes('logs')).flush([]);
    expect(component.nombre).toBe('Administrador');
  });

  it('cargarDatos debe actualizar KPIs con reservas del mes', () => {
    const hoy = new Date();
    const fechaHoy = `${hoy.getFullYear()}-${String(hoy.getMonth()+1).padStart(2,'0')}-${String(hoy.getDate()).padStart(2,'0')}`;
    const mockReservas: any[] = [
      { fecha: fechaHoy, estado: 'confirmada', totalServicios: 100000, idTerapeuta: 1 },
      { fecha: fechaHoy, estado: 'pendiente', totalServicios: 50000, idTerapeuta: 2 },
      { fecha: '2026-01-01', estado: 'cancelada', totalServicios: 30000, idTerapeuta: 1 }
    ];
    const mockUsuarios: any[] = [
      { id: 1, nombre: 'Maria', correo: 'm@test.com', rol: 'terapeuta', estado: 'activo' },
      { id: 2, nombre: 'Juan', correo: 'j@test.com', rol: 'cliente', estado: 'activo' }
    ];

    component.cargarDatos();
    httpMock.expectOne(req => req.url.includes('reservas/filtrar') && req.url.includes('fechaInicio')).flush(mockReservas);
    httpMock.expectOne(`${environment.apiUrl}/usuarios`).flush(mockUsuarios);
    httpMock.expectOne(req => req.url.includes('reservas/filtrar')).flush([]);
    httpMock.expectOne(`${environment.apiUrl}/servicios`).flush([
      { idServicio: 1, nombre: 'Masaje', estado: 'activo', precio: 100, duracionMinutos: 60, descripcion: '' }
    ]);
    httpMock.expectOne(req => req.url.includes('logs')).flush([
      { idLog: 1, tipo: 'LOGIN_EXITOSO', idUsuario: 1, nombreUsuario: 'Admin', descripcion: '', ip: '', fechaHora: '2026-01-01T09:00:00' }
    ]);

    expect(component.kpiCards[1].value).toBe('2');
    expect(component.estadosReservas[1].count).toBe(1);
    expect(component.servicios.length).toBe(1);
    expect(component.logsRecientes.length).toBe(1);
  });

  it('cargarDatos debe mapear profesionales correctamente', () => {
    const mockUsuarios: any[] = [
      { id: 1, nombre: 'Maria', correo: 'm@test.com', rol: 'terapeuta', estado: 'activo' }
    ];
    const mockReservasHoy: any[] = [
      { idTerapeuta: 1, estado: 'confirmada', fecha: '2026-01-15', totalServicios: 100000 }
    ];

    component.cargarDatos();
    httpMock.expectOne(req => req.url.includes('reservas/filtrar') && req.url.includes('fechaInicio')).flush([]);
    httpMock.expectOne(`${environment.apiUrl}/usuarios`).flush(mockUsuarios);
    httpMock.expectOne(req => req.url.includes('reservas/filtrar')).flush(mockReservasHoy);
    httpMock.expectOne(`${environment.apiUrl}/servicios`).flush([]);
    httpMock.expectOne(req => req.url.includes('logs')).flush([]);

    expect(component.profesionales.length).toBe(1);
    expect(component.profesionales[0].nombre).toBe('Maria');
    expect(component.profesionales[0].estadoLabel).toBe('ACTIVO');
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

  it('getDonaOffset debe calcular offset para segundo elemento', () => {
    component.estadosReservas[0].count = 2;
    component.estadosReservas[1].count = 2;
    expect(component.getDonaOffset(1)).toBe(50);
  });

  it('getTipoLogIcon debe retornar icono correcto para LOGIN_EXITOSO', () => {
    expect(component.getTipoLogIcon('LOGIN_EXITOSO')).toBe('login');
  });

  it('getTipoLogIcon debe retornar icono correcto para LOGIN_FALLIDO', () => {
    expect(component.getTipoLogIcon('LOGIN_FALLIDO')).toBe('no_accounts');
  });

  it('getTipoLogIcon debe retornar icono correcto para LOGOUT', () => {
    expect(component.getTipoLogIcon('LOGOUT')).toBe('logout');
  });

  it('getTipoLogIcon debe retornar info para tipo desconocido', () => {
    expect(component.getTipoLogIcon('DESCONOCIDO')).toBe('info');
  });

  it('getTipoLogColor debe retornar color correcto para LOGIN_EXITOSO', () => {
    expect(component.getTipoLogColor('LOGIN_EXITOSO')).toBe('#a8e6a3');
  });

  it('getTipoLogColor debe retornar color correcto para LOGIN_FALLIDO', () => {
    expect(component.getTipoLogColor('LOGIN_FALLIDO')).toBe('#ffb4ab');
  });

  it('getTipoLogColor debe retornar color correcto para LOGOUT', () => {
    expect(component.getTipoLogColor('LOGOUT')).toBe('#7eb8f7');
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

  it('formatFechaHora debe formatear fecha correctamente', () => {
    const resultado = component.formatFechaHora('2026-01-15T09:30:00');
    expect(resultado).toBeTruthy();
    expect(typeof resultado).toBe('string');
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