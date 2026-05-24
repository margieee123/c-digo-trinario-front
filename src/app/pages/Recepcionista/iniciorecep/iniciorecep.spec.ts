import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { vi } from 'vitest';
import { IniciorecepComponent } from './iniciorecep';

describe('IniciorecepComponent', () => {
  let component: IniciorecepComponent;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IniciorecepComponent],
      providers: [
        provideRouter([{ path: '**', redirectTo: '' }]),
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    }).compileComponents();

    const fixture = TestBed.createComponent(IniciorecepComponent);
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

  it('debe leer nombre desde localStorage', () => {
    localStorage.setItem('nombre', 'Recep Test');
    component.ngOnInit();
    expect(component.nombre).toBe('Recep Test');
  });

  it('debe usar Recepcionista como nombre por defecto', () => {
    component.ngOnInit();
    expect(component.nombre).toBe('Recepcionista');
  });

  it('calcularKpis debe contar citas correctamente', () => {
    component.reservasHoy = [
      { idReserva: 1, idCliente: 1, nombreCliente: 'C1', idServicios: [1],
        nombresServicios: ['S1'], idTerapeuta: 1, nombreTerapeuta: 'T1',
        fecha: '2026-01-01', horaInicio: '09:00', horaFin: '10:00',
        estado: 'pendiente', totalServicios: 100000 },
      { idReserva: 2, idCliente: 2, nombreCliente: 'C2', idServicios: [1],
        nombresServicios: ['S1'], idTerapeuta: 1, nombreTerapeuta: 'T1',
        fecha: '2026-01-01', horaInicio: '10:00', horaFin: '11:00',
        estado: 'confirmada', totalServicios: 80000 },
      { idReserva: 3, idCliente: 3, nombreCliente: 'C3', idServicios: [1],
        nombresServicios: ['S1'], idTerapeuta: 1, nombreTerapeuta: 'T1',
        fecha: '2026-01-01', horaInicio: '11:00', horaFin: '12:00',
        estado: 'cancelada', totalServicios: 50000 }
    ];
    component.calcularKpis();
    expect(component.citasHoy).toBe(2);
    expect(component.citasPendientes).toBe(1);
    expect(component.citasConfirmadas).toBe(1);
  });

  it('calcularKpis debe calcular totalPendienteHoy correctamente', () => {
    component.reservasHoy = [
      { idReserva: 1, idCliente: 1, nombreCliente: 'C1', idServicios: [1],
        nombresServicios: ['S1'], idTerapeuta: 1, nombreTerapeuta: 'T1',
        fecha: '2026-01-01', horaInicio: '09:00', horaFin: '10:00',
        estado: 'pendiente', totalServicios: 100000 },
      { idReserva: 2, idCliente: 2, nombreCliente: 'C2', idServicios: [1],
        nombresServicios: ['S1'], idTerapeuta: 1, nombreTerapeuta: 'T1',
        fecha: '2026-01-01', horaInicio: '10:00', horaFin: '11:00',
        estado: 'finalizada', totalServicios: 80000 }
    ];
    component.calcularKpis();
    expect(component.totalPendienteHoy).toBe(100000);
  });

  it('reservasFiltradas debe retornar todas cuando filtro es todas', () => {
    component.reservasHoy = [
      { idReserva: 1, idCliente: 1, nombreCliente: 'C1', idServicios: [1],
        nombresServicios: ['S1'], idTerapeuta: 1, nombreTerapeuta: 'T1',
        fecha: '2026-01-01', horaInicio: '09:00', horaFin: '10:00',
        estado: 'pendiente', totalServicios: 100000 },
      { idReserva: 2, idCliente: 2, nombreCliente: 'C2', idServicios: [1],
        nombresServicios: ['S1'], idTerapeuta: 1, nombreTerapeuta: 'T1',
        fecha: '2026-01-01', horaInicio: '10:00', horaFin: '11:00',
        estado: 'confirmada', totalServicios: 80000 }
    ];
    component.filtroActivo = 'todas';
    expect(component.reservasFiltradas.length).toBe(2);
  });

  it('reservasFiltradas debe filtrar por pendientes', () => {
    component.reservasHoy = [
      { idReserva: 1, idCliente: 1, nombreCliente: 'C1', idServicios: [1],
        nombresServicios: ['S1'], idTerapeuta: 1, nombreTerapeuta: 'T1',
        fecha: '2026-01-01', horaInicio: '09:00', horaFin: '10:00',
        estado: 'pendiente', totalServicios: 100000 },
      { idReserva: 2, idCliente: 2, nombreCliente: 'C2', idServicios: [1],
        nombresServicios: ['S1'], idTerapeuta: 1, nombreTerapeuta: 'T1',
        fecha: '2026-01-01', horaInicio: '10:00', horaFin: '11:00',
        estado: 'confirmada', totalServicios: 80000 }
    ];
    component.filtroActivo = 'pendientes';
    expect(component.reservasFiltradas.length).toBe(1);
    expect(component.reservasFiltradas[0].estado).toBe('pendiente');
  });

  it('reservasFiltradas debe filtrar por confirmadas', () => {
    component.reservasHoy = [
      { idReserva: 1, idCliente: 1, nombreCliente: 'C1', idServicios: [1],
        nombresServicios: ['S1'], idTerapeuta: 1, nombreTerapeuta: 'T1',
        fecha: '2026-01-01', horaInicio: '09:00', horaFin: '10:00',
        estado: 'pendiente', totalServicios: 100000 },
      { idReserva: 2, idCliente: 2, nombreCliente: 'C2', idServicios: [1],
        nombresServicios: ['S1'], idTerapeuta: 1, nombreTerapeuta: 'T1',
        fecha: '2026-01-01', horaInicio: '10:00', horaFin: '11:00',
        estado: 'confirmada', totalServicios: 80000 }
    ];
    component.filtroActivo = 'confirmadas';
    expect(component.reservasFiltradas.length).toBe(1);
    expect(component.reservasFiltradas[0].estado).toBe('confirmada');
  });

  it('cambiarFiltro debe actualizar filtroActivo', () => {
    component.cambiarFiltro('pendientes');
    expect(component.filtroActivo).toBe('pendientes');
  });

  it('buscarCliente debe limpiar resultados si busqueda es muy corta', () => {
    component.busquedaCliente = 'a';
    component.clientesEncontrados = [{ id: 1, nombre: 'Test', correo: 'test@test.com', rol: 'cliente', estado: 'activo' }];
    component.buscarCliente();
    expect(component.clientesEncontrados.length).toBe(0);
  });

  it('getEstadoIcon debe retornar icono correcto para pendiente', () => {
    expect(component.getEstadoIcon('pendiente')).toBe('schedule');
  });

  it('getEstadoIcon debe retornar icono correcto para confirmada', () => {
    expect(component.getEstadoIcon('confirmada')).toBe('check_circle');
  });

  it('getEstadoIcon debe retornar info para estado desconocido', () => {
    expect(component.getEstadoIcon('desconocido')).toBe('info');
  });

  it('getEstadoClass debe retornar clase correcta para pendiente', () => {
    expect(component.getEstadoClass('pendiente')).toBe('estado--pendiente');
  });

  it('getEstadoClass debe retornar string vacio para estado desconocido', () => {
    expect(component.getEstadoClass('desconocido')).toBe('');
  });

  it('irANuevaReserva debe navegar a recepcionista reservas', () => {
    const spy = vi.spyOn(router, 'navigate').mockResolvedValue(true);
    component.irANuevaReserva();
    expect(spy).toHaveBeenCalledWith(['/dashboard/recepcionista/reservas']);
  });

  it('irAAgenda debe navegar a recepcionista agenda', () => {
    const spy = vi.spyOn(router, 'navigate').mockResolvedValue(true);
    component.irAAgenda();
    expect(spy).toHaveBeenCalledWith(['/dashboard/recepcionista/agenda']);
  });

  it('irAFacturacion debe navegar a recepcionista facturacion', () => {
    const spy = vi.spyOn(router, 'navigate').mockResolvedValue(true);
    component.irAFacturacion();
    expect(spy).toHaveBeenCalledWith(['/dashboard/recepcionista/facturacion']);
  });

  it('cerrarSesion debe limpiar localStorage y navegar al login', () => {
    const spy = vi.spyOn(router, 'navigate').mockResolvedValue(true);
    localStorage.setItem('token', 'fake-token');
    component.cerrarSesion();
    expect(localStorage.getItem('token')).toBeNull();
    expect(spy).toHaveBeenCalledWith(['/login']);
  });
});