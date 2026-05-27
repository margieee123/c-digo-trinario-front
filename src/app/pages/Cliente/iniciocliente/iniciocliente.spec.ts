import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { vi } from 'vitest';
import { InicioclienteComponent } from './iniciocliente';
import { environment } from 'environments/environment';

describe('InicioclienteComponent', () => {
  let component: InicioclienteComponent;
  let router: Router;
  let httpMock: HttpTestingController;

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
    httpMock = TestBed.inject(HttpTestingController);
    localStorage.clear();
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  const mockReserva = (fecha: string, estado = 'confirmada') => ({
    idReserva: 1, fecha, estado,
    horaInicio: '09:00:00', horaFin: '10:00:00',
    totalServicios: 100000, idServicios: [1],
    nombresServicios: ['Masaje'], idCliente: 1,
    idTerapeuta: 1, nombreCliente: 'Test', nombreTerapeuta: 'T1'
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('debe leer nombre desde localStorage', () => {
    localStorage.setItem('nombre', 'Cliente Test');
    component.ngOnInit();
    httpMock.expectOne(`${environment.apiUrl}/reservas/mis-reservas`).flush([]);
    httpMock.expectOne(`${environment.apiUrl}/servicios`).flush([]);
    expect(component.nombre).toBe('Cliente Test');
  });

  it('debe usar Cliente como nombre por defecto', () => {
    component.ngOnInit();
    httpMock.expectOne(`${environment.apiUrl}/reservas/mis-reservas`).flush([]);
    httpMock.expectOne(`${environment.apiUrl}/servicios`).flush([]);
    expect(component.nombre).toBe('Cliente');
  });

  it('cargarReservas debe cargar y ordenar reservas', () => {
    const mockReservas = [
      { ...mockReserva('2026-01-10'), idReserva: 1 },
      { ...mockReserva('2026-06-20'), idReserva: 2, estado: 'pendiente' }
    ];
    component.cargarReservas();
    httpMock.expectOne(`${environment.apiUrl}/reservas/mis-reservas`).flush(mockReservas);
    expect(component.misReservas.length).toBe(2);
    expect(component.misReservas[0].fecha >= component.misReservas[1].fecha).toBe(true);
  });

  it('cargarReservas debe asignar proximaReserva correctamente', () => {
    const hoy = new Date();
    const manana = new Date(hoy);
    manana.setDate(hoy.getDate() + 1);
    const fechaManana = `${manana.getFullYear()}-${String(manana.getMonth()+1).padStart(2,'0')}-${String(manana.getDate()).padStart(2,'0')}`;
    component.cargarReservas();
    httpMock.expectOne(`${environment.apiUrl}/reservas/mis-reservas`).flush([mockReserva(fechaManana)]);
    expect(component.proximaReserva).not.toBeNull();
    expect(component.proximaReserva!.idReserva).toBe(1);
  });

  it('cargarReservas no asigna proximaReserva si esta cancelada', () => {
    const hoy = new Date();
    const manana = new Date(hoy);
    manana.setDate(hoy.getDate() + 1);
    const fechaManana = `${manana.getFullYear()}-${String(manana.getMonth()+1).padStart(2,'0')}-${String(manana.getDate()).padStart(2,'0')}`;
    component.cargarReservas();
    httpMock.expectOne(`${environment.apiUrl}/reservas/mis-reservas`).flush([mockReserva(fechaManana, 'cancelada')]);
    expect(component.proximaReserva).toBeNull();
  });

  it('cargarServicios debe cargar solo servicios activos', () => {
    const mockServicios = [
      { idServicio: 1, nombre: 'Masaje', descripcion: '', precio: 100, duracionMinutos: 60, estado: 'activo', imagenUrl: '' },
      { idServicio: 2, nombre: 'Facial', descripcion: '', precio: 80, duracionMinutos: 45, estado: 'inactivo', imagenUrl: '' }
    ];
    component.cargarServicios();
    httpMock.expectOne(`${environment.apiUrl}/servicios`).flush(mockServicios);
    expect(component.servicios.length).toBe(1);
    expect(component.servicios[0].nombre).toBe('Masaje');
  });

  it('generarSemana debe crear 7 dias', () => {
    component.misReservas = [];
    component.generarSemana();
    expect(component.semana.length).toBe(7);
  });

  it('generarSemana debe marcar esHoy correctamente', () => {
    component.misReservas = [];
    component.lunesActual = component['getLunes'](new Date());
    component.generarSemana();
    const hoy = component.semana.find(d => d.esHoy);
    expect(hoy).toBeTruthy();
  });

  it('generarSemana debe asignar reservas del dia correctamente', () => {
    const lunes = component['getLunes'](new Date());
    const fechaLunes = `${lunes.getFullYear()}-${String(lunes.getMonth()+1).padStart(2,'0')}-${String(lunes.getDate()).padStart(2,'0')}`;
    component.misReservas = [mockReserva(fechaLunes) as any];
    component.lunesActual = lunes;
    component.generarSemana();
    expect(component.semana[0].reservas.length).toBe(1);
  });

  it('semanaLabel debe retornar string no vacio', () => {
    expect(component.semanaLabel.length).toBeGreaterThan(0);
  });

  it('semanaAnterior debe retroceder 7 dias', () => {
    const lunesOriginal = new Date(component.lunesActual);
    component.semanaAnterior();
    expect(lunesOriginal.getTime() - component.lunesActual.getTime()).toBe(7 * 24 * 60 * 60 * 1000);
  });

  it('semanaSiguiente debe avanzar 7 dias', () => {
    const lunesOriginal = new Date(component.lunesActual);
    component.semanaSiguiente();
    expect(component.lunesActual.getTime() - lunesOriginal.getTime()).toBe(7 * 24 * 60 * 60 * 1000);
  });

  it('getAltoEvento debe calcular altura minima de 28px', () => {
    const reserva: any = { horaInicio: '09:00:00', horaFin: '09:00:00', idServicios: [1], nombresServicios: ['Masaje'] };
    expect(component.getAltoEvento(reserva)).toBe(28);
  });

  it('getAltoEvento debe calcular altura de 60 minutos correctamente', () => {
    const reserva: any = { horaInicio: '09:00:00', horaFin: '10:00:00', idServicios: [1], nombresServicios: ['Masaje'] };
    expect(component.getAltoEvento(reserva)).toBe(56);
  });

  it('getEstadoColorCalendario debe retornar clase correcta para confirmada', () => {
    expect(component.getEstadoColorCalendario('confirmada')).toBe('evento--confirmada');
  });

  it('getEstadoColorCalendario debe retornar clase correcta para en_proceso', () => {
    expect(component.getEstadoColorCalendario('en_proceso')).toBe('evento--proceso');
  });

  it('getEstadoColorCalendario debe retornar clase correcta para finalizada', () => {
    expect(component.getEstadoColorCalendario('finalizada')).toBe('evento--finalizada');
  });

  it('getEstadoColorCalendario debe retornar clase correcta para cancelada', () => {
    expect(component.getEstadoColorCalendario('cancelada')).toBe('evento--cancelada');
  });

  it('getEstadoColorCalendario debe retornar clase por defecto para estado desconocido', () => {
    expect(component.getEstadoColorCalendario('desconocido')).toBe('evento--pendiente');
  });

  it('getEstadoClass debe retornar clase correcta para todos los estados', () => {
    expect(component.getEstadoClass('pendiente')).toBe('estado--pendiente');
    expect(component.getEstadoClass('confirmada')).toBe('estado--confirmada');
    expect(component.getEstadoClass('en_proceso')).toBe('estado--proceso');
    expect(component.getEstadoClass('finalizada')).toBe('estado--finalizada');
    expect(component.getEstadoClass('cancelada')).toBe('estado--cancelada');
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

  it('isServicioSeleccionado debe retornar true y false correctamente', () => {
    component.serviciosSeleccionados = [1];
    expect(component.isServicioSeleccionado(1)).toBe(true);
    expect(component.isServicioSeleccionado(2)).toBe(false);
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
    expect(component.toasts[0].type).toBe('error');
  });

  it('crearReserva debe verificar disponibilidad y crear reserva', () => {
    component.serviciosSeleccionados = [1];
    component.fechaSeleccionada = '2026-06-15';
    component.horaSeleccionada = '09:00:00';
    component.servicios = [{ idServicio: 1, nombre: 'Masaje', descripcion: '', precio: 100, duracionMinutos: 60, estado: 'activo', imagenUrl: '' }];
    component.crearReserva();
    httpMock.expectOne(req => req.url.includes('terapeuta-disponible')).flush({ idTerapeuta: 1 });
    httpMock.expectOne(`${environment.apiUrl}/reservas`).flush({});
    httpMock.expectOne(`${environment.apiUrl}/reservas/mis-reservas`).flush([]);
    expect(component.toasts[0].type).toBe('success');
    expect(component.modalAbierto).toBe(false);
  });

  it('crearReserva debe mostrar error si falla POST reserva', () => {
    component.serviciosSeleccionados = [1];
    component.fechaSeleccionada = '2026-06-15';
    component.horaSeleccionada = '09:00:00';
    component.servicios = [{ idServicio: 1, nombre: 'Masaje', descripcion: '', precio: 100, duracionMinutos: 60, estado: 'activo', imagenUrl: '' }];
    component.crearReserva();
    httpMock.expectOne(req => req.url.includes('terapeuta-disponible')).flush({ idTerapeuta: 1 });
    httpMock.expectOne(`${environment.apiUrl}/reservas`).flush('error', { status: 500, statusText: 'Server Error' });
    expect(component.toasts[0].type).toBe('error');
    expect(component.creandoReserva).toBe(false);
  });

  it('crearReserva debe mostrar mensaje si no hay terapeutas disponibles 404', () => {
    component.serviciosSeleccionados = [1];
    component.fechaSeleccionada = '2026-06-15';
    component.horaSeleccionada = '09:00:00';
    component.crearReserva();
    httpMock.expectOne(req => req.url.includes('terapeuta-disponible')).flush('', { status: 404, statusText: 'Not Found' });
    expect(component.mensajeDisponibilidad).toContain('No hay terapeutas disponibles');
  });

  it('crearReserva debe mostrar mensaje generico en error de disponibilidad', () => {
    component.serviciosSeleccionados = [1];
    component.fechaSeleccionada = '2026-06-15';
    component.horaSeleccionada = '09:00:00';
    component.crearReserva();
    httpMock.expectOne(req => req.url.includes('terapeuta-disponible')).flush('', { status: 500, statusText: 'Server Error' });
    expect(component.mensajeDisponibilidad).toContain('Error al verificar');
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

  it('confirmarCancelacion debe hacer PATCH y mostrar toast', () => {
    component.reservaParaCancelar = { idReserva: 1 } as any;
    component.confirmarCancelacion();
    httpMock.expectOne(`${environment.apiUrl}/reservas/1/cancelar`).flush({});
    httpMock.expectOne(`${environment.apiUrl}/reservas/mis-reservas`).flush([]);
    expect(component.toasts[0].type).toBe('success');
    expect(component.modalCancelarAbierto).toBe(false);
    expect(component.reservaParaCancelar).toBeNull();
  });

  it('confirmarCancelacion debe mostrar toast en error', () => {
    component.reservaParaCancelar = { idReserva: 1 } as any;
    component.confirmarCancelacion();
    httpMock.expectOne(`${environment.apiUrl}/reservas/1/cancelar`).flush('error', { status: 500, statusText: 'Server Error' });
    expect(component.toasts[0].type).toBe('error');
  });

  it('confirmarCancelacion no ejecuta si reservaParaCancelar es null', () => {
    component.reservaParaCancelar = null;
    component.confirmarCancelacion();
    httpMock.expectNone(`${environment.apiUrl}/reservas/1/cancelar`);
  });

  it('cancelarReserva debe abrir modal cancelar', () => {
    const r: any = { idReserva: 1, estado: 'pendiente' };
    component.cancelarReserva(r);
    expect(component.modalCancelarAbierto).toBe(true);
  });

  it('abrirEditModal debe configurar formulario de edicion', () => {
    const r: any = { idReserva: 1, fecha: '2026-06-01', horaInicio: '09:00:00', idServicios: [1, 2], estado: 'pendiente', nombresServicios: ['Masaje'] };
    component.abrirEditModal(r);
    expect(component.showEditModal).toBe(true);
    expect(component.editForm.fecha).toBe('2026-06-01');
    expect(component.editForm.horaInicio).toBe('09:00');
    expect(component.serviciosEditando).toEqual([1, 2]);
    expect(component.modalDetalleAbierto).toBe(false);
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

  it('abrirEditServicios debe abrir modal de servicios', () => {
    const event = { stopPropagation: vi.fn() } as any;
    component.abrirEditServicios(event);
    expect(component.showEditServiciosModal).toBe(true);
  });

  it('cerrarEditServicios debe cerrar modal de servicios', () => {
    component.showEditServiciosModal = true;
    component.cerrarEditServicios();
    expect(component.showEditServiciosModal).toBe(false);
    expect(component.isSubmittingServicios).toBe(false);
  });

  it('toggleServicioEdit debe agregar y quitar servicio', () => {
    component.serviciosEditando = [];
    component.toggleServicioEdit(1);
    expect(component.serviciosEditando).toContain(1);
    component.toggleServicioEdit(1);
    expect(component.serviciosEditando).not.toContain(1);
  });

  it('estaSeleccionadoEdit debe retornar true y false correctamente', () => {
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

  it('guardarEdicion no ejecuta si isSubmittingEdit es true', () => {
    component.reservaEditando = { idReserva: 1 } as any;
    component.serviciosEditando = [1];
    component.isSubmittingEdit = true;
    component.guardarEdicion();
    httpMock.expectNone(`${environment.apiUrl}/reservas/1/cliente`);
  });

  it('guardarEdicion debe hacer PUT y cerrar modal', () => {
    component.reservaEditando = { idReserva: 1 } as any;
    component.serviciosEditando = [1];
    component.editForm = { fecha: '2026-06-15', horaInicio: '09:00' };
    component.guardarEdicion();
    httpMock.expectOne(`${environment.apiUrl}/reservas/1/cliente`).flush({});
    httpMock.expectOne(`${environment.apiUrl}/reservas/mis-reservas`).flush([]);
    expect(component.showEditModal).toBe(false);
    expect(component.toasts[0].type).toBe('success');
  });

  it('guardarEdicion debe mostrar mensaje en error', () => {
    component.reservaEditando = { idReserva: 1 } as any;
    component.serviciosEditando = [1];
    component.editForm = { fecha: '2026-06-15', horaInicio: '09:00' };
    component.guardarEdicion();
    httpMock.expectOne(`${environment.apiUrl}/reservas/1/cliente`).flush({ message: 'No disponible' }, { status: 400, statusText: 'Bad Request' });
    expect(component.mensajeEditDisponibilidad).toBeTruthy();
    expect(component.isSubmittingEdit).toBe(false);
  });

  it('guardarEdicion no ejecuta si reservaEditando es null', () => {
    component.reservaEditando = null;
    component.serviciosEditando = [1];
    component.guardarEdicion();
    httpMock.expectNone(`${environment.apiUrl}/reservas/null/cliente`);
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
    expect(component.toasts[0].type).toBe('success');
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

  it('getReservaEnSlot debe retornar null si no hay reserva', () => {
    const dia: any = { reservas: [] };
    expect(component.getReservaEnSlot(dia, 9)).toBeNull();
  });

  it('getReservaEnSlot debe retornar reserva si coincide la hora', () => {
    const reserva: any = { horaInicio: '09:00:00', idServicios: [1], nombresServicios: ['Masaje'] };
    const dia: any = { reservas: [reserva] };
    expect(component.getReservaEnSlot(dia, 9)).toEqual(reserva);
  });

  it('clickReserva debe abrir modal detalle', () => {
    const reserva: any = { idReserva: 1 };
    const event = { stopPropagation: vi.fn() } as any;
    component.clickReserva(reserva, event);
    expect(component.modalDetalleAbierto).toBe(true);
    expect(component.reservaDetalle).toEqual(reserva);
  });

  it('clickSlotVacio debe navegar si la fecha no es pasada', () => {
    const spy = vi.spyOn(router, 'navigate').mockResolvedValue(true);
    const manana = new Date();
    manana.setDate(manana.getDate() + 1);
    const dia: any = { fecha: manana, reservas: [] };
    component.clickSlotVacio(dia, 9);
    expect(spy).toHaveBeenCalled();
  });

  it('clickSlotVacio no debe navegar si la fecha es pasada', () => {
    const spy = vi.spyOn(router, 'navigate').mockResolvedValue(true);
    const ayer = new Date();
    ayer.setDate(ayer.getDate() - 1);
    const dia: any = { fecha: ayer, reservas: [] };
    component.clickSlotVacio(dia, 9);
    expect(spy).not.toHaveBeenCalled();
  });
});