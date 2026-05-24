import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { vi } from 'vitest';
import { InicioclienteComponent } from './iniciocliente';

describe('InicioclienteComponent', () => {
  let component: InicioclienteComponent;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InicioclienteComponent],
      providers: [
        provideRouter([{ path: '**', redirectTo: '' }]),
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    }).compileComponents();

    const fixture = TestBed.createComponent(InicioclienteComponent);
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
    localStorage.setItem('nombre', 'Cliente Test');
    localStorage.setItem('token', 'fake-token');
    component.ngOnInit();
    expect(component.nombre).toBe('Cliente Test');
  });

  it('debe usar Cliente como nombre por defecto', () => {
    component.ngOnInit();
    expect(component.nombre).toBe('Cliente');
  });

  it('generarSemana debe crear 7 dias', () => {
    component.misReservas = [];
    component.generarSemana();
    expect(component.semana.length).toBe(7);
  });

  it('semanaLabel debe retornar string no vacio', () => {
    expect(component.semanaLabel.length).toBeGreaterThan(0);
  });

  it('semanaAnterior debe retroceder 7 dias', () => {
    const lunesOriginal = new Date(component.lunesActual);
    component.semanaAnterior();
    const diferencia = lunesOriginal.getTime() - component.lunesActual.getTime();
    expect(diferencia).toBe(7 * 24 * 60 * 60 * 1000);
  });

  it('semanaSiguiente debe avanzar 7 dias', () => {
    const lunesOriginal = new Date(component.lunesActual);
    component.semanaSiguiente();
    const diferencia = component.lunesActual.getTime() - lunesOriginal.getTime();
    expect(diferencia).toBe(7 * 24 * 60 * 60 * 1000);
  });

  it('getAltoEvento debe calcular altura minima de 28px', () => {
    const reserva: any = { horaInicio: '09:00', horaFin: '09:00', idServicios: [], nombresServicios: [] };
    expect(component.getAltoEvento(reserva)).toBe(28);
  });

  it('getAltoEvento debe calcular altura de 60 minutos correctamente', () => {
    const reserva: any = { horaInicio: '09:00', horaFin: '10:00', idServicios: [], nombresServicios: [] };
    expect(component.getAltoEvento(reserva)).toBe(56);
  });

  it('getEstadoColorCalendario debe retornar clase correcta para pendiente', () => {
    expect(component.getEstadoColorCalendario('pendiente')).toBe('evento--pendiente');
  });

  it('getEstadoColorCalendario debe retornar clase por defecto para estado desconocido', () => {
    expect(component.getEstadoColorCalendario('desconocido')).toBe('evento--pendiente');
  });

  it('getEstadoClass debe retornar clase correcta para pendiente', () => {
    expect(component.getEstadoClass('pendiente')).toBe('estado--pendiente');
  });

  it('getEstadoClass debe retornar string vacio para estado desconocido', () => {
    expect(component.getEstadoClass('desconocido')).toBe('');
  });

  it('toggleServicio debe agregar servicio si no esta seleccionado', () => {
    component.serviciosSeleccionados = [];
    component.toggleServicio(1);
    expect(component.serviciosSeleccionados).toContain(1);
  });

  it('toggleServicio debe quitar servicio si ya esta seleccionado', () => {
    component.serviciosSeleccionados = [1];
    component.toggleServicio(1);
    expect(component.serviciosSeleccionados).not.toContain(1);
  });

  it('isServicioSeleccionado debe retornar true si esta seleccionado', () => {
    component.serviciosSeleccionados = [1];
    expect(component.isServicioSeleccionado(1)).toBe(true);
  });

  it('duracionTotal debe sumar duraciones de servicios seleccionados', () => {
    component.servicios = [
      { idServicio: 1, nombre: 'Masaje', descripcion: '', precio: 100, duracionMinutos: 60, estado: 'activo', imagenUrl: '' },
      { idServicio: 2, nombre: 'Facial', descripcion: '', precio: 80, duracionMinutos: 45, estado: 'activo', imagenUrl: '' }
    ];
    component.serviciosSeleccionados = [1, 2];
    expect(component.duracionTotal).toBe(105);
  });

  it('precioTotal debe sumar precios de servicios seleccionados', () => {
    component.servicios = [
      { idServicio: 1, nombre: 'Masaje', descripcion: '', precio: 100000, duracionMinutos: 60, estado: 'activo', imagenUrl: '' },
      { idServicio: 2, nombre: 'Facial', descripcion: '', precio: 80000, duracionMinutos: 45, estado: 'activo', imagenUrl: '' }
    ];
    component.serviciosSeleccionados = [1, 2];
    expect(component.precioTotal).toBe(180000);
  });

  it('crearReserva debe mostrar error si no hay servicios seleccionados', () => {
    component.serviciosSeleccionados = [];
    component.crearReserva();
    expect(component.toasts.length).toBeGreaterThan(0);
    expect(component.toasts[0].type).toBe('error');
  });

  it('cerrarModal debe limpiar estado', () => {
    component.modalAbierto = true;
    component.serviciosSeleccionados = [1, 2];
    component.mensajeDisponibilidad = 'Test';
    component.cerrarModal();
    expect(component.modalAbierto).toBe(false);
    expect(component.serviciosSeleccionados.length).toBe(0);
    expect(component.mensajeDisponibilidad).toBe('');
  });

  it('abrirModalCancelar debe asignar reserva y abrir modal', () => {
    const r: any = { idReserva: 1, estado: 'pendiente' };
    component.abrirModalCancelar(r);
    expect(component.modalCancelarAbierto).toBe(true);
    expect(component.reservaParaCancelar).toEqual(r);
    expect(component.modalDetalleAbierto).toBe(false);
  });

  it('abrirEditModal debe configurar el formulario de edicion', () => {
    const r: any = {
      idReserva: 1, fecha: '2026-06-01', horaInicio: '09:00:00',
      idServicios: [1, 2], estado: 'pendiente'
    };
    component.abrirEditModal(r);
    expect(component.showEditModal).toBe(true);
    expect(component.editForm.fecha).toBe('2026-06-01');
    expect(component.editForm.horaInicio).toBe('09:00');
    expect(component.serviciosEditando).toEqual([1, 2]);
  });

  it('cerrarEditModal debe limpiar estado', () => {
    component.showEditModal = true;
    component.isSubmittingEdit = true;
    component.mensajeEditDisponibilidad = 'Test';
    component.cerrarEditModal();
    expect(component.showEditModal).toBe(false);
    expect(component.isSubmittingEdit).toBe(false);
    expect(component.mensajeEditDisponibilidad).toBe('');
  });

  it('toggleServicioEdit debe agregar servicio si no esta en lista', () => {
    component.serviciosEditando = [];
    component.toggleServicioEdit(1);
    expect(component.serviciosEditando).toContain(1);
  });

  it('toggleServicioEdit debe quitar servicio si ya esta en lista', () => {
    component.serviciosEditando = [1, 2];
    component.toggleServicioEdit(1);
    expect(component.serviciosEditando).not.toContain(1);
  });

  it('estaSeleccionadoEdit debe retornar true si servicio esta en lista', () => {
    component.serviciosEditando = [1, 2];
    expect(component.estaSeleccionadoEdit(1)).toBe(true);
    expect(component.estaSeleccionadoEdit(3)).toBe(false);
  });

  it('guardarEdicion debe mostrar error si serviciosEditando esta vacio', () => {
    component.reservaEditando = { idReserva: 1 } as any;
    component.serviciosEditando = [];
    component.guardarEdicion();
    expect(component.mensajeEditDisponibilidad).toBe('Selecciona al menos un servicio.');
  });

  it('setCalificacion debe asignar valor', () => {
    component.setCalificacion(4);
    expect(component.calificacion).toBe(4);
  });

  it('enviarComentario debe limpiar comentario y calificacion', () => {
    component.comentario = 'Excelente';
    component.calificacion = 5;
    component.enviarComentario();
    expect(component.comentario).toBe('');
    expect(component.calificacion).toBe(0);
  });

  it('showToast debe agregar toast a la lista', () => {
    component.showToast('Test', 'success');
    expect(component.toasts.length).toBe(1);
    expect(component.toasts[0].message).toBe('Test');
  });

  it('irANuevaReserva debe navegar a cliente reservas', () => {
    const spy = vi.spyOn(router, 'navigate').mockResolvedValue(true);
    component.irANuevaReserva();
    expect(spy).toHaveBeenCalledWith(['/dashboard/cliente/reservas']);
  });

  it('getReservaEnSlot debe retornar null si no hay reserva en ese slot', () => {
    const dia: any = { reservas: [] };
    expect(component.getReservaEnSlot(dia, 9)).toBeNull();
  });

  it('getReservaEnSlot debe retornar reserva si coincide la hora', () => {
    const reserva: any = { horaInicio: '09:00:00', idServicios: [] };
    const dia: any = { reservas: [reserva] };
    expect(component.getReservaEnSlot(dia, 9)).toEqual(reserva);
  });
});