import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { vi } from 'vitest';
import { Agendaadmi } from './Agendaadmi';
import { environment } from 'environments/environment';

describe('Agendaadmi', () => {
  let component: Agendaadmi;
  let router: Router;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Agendaadmi],
      providers: [
        provideRouter([{ path: '**', redirectTo: '' }]),
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    }).compileComponents();

    const fixture = TestBed.createComponent(Agendaadmi);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    httpMock = TestBed.inject(HttpTestingController);
    localStorage.clear();
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  function flushInit() {
    httpMock.expectOne(req => req.url.includes('reservas/filtrar')).flush([]);
    httpMock.expectOne(`${environment.apiUrl}/usuarios`).flush([]);
    httpMock.expectOne(`${environment.apiUrl}/servicios`).flush([]);
  }

  const mockReserva = (fecha: string, estado = 'confirmada') => ({
    idReserva: 1, fecha, estado, totalServicios: 100000,
    idTerapeuta: 1, nombreTerapeuta: 'T1', idCliente: 1, nombreCliente: 'C1',
    idServicios: [1], nombresServicios: ['Masaje'],
    horaInicio: '09:00:00', horaFin: '10:00:00'
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('debe leer nombre y rol desde localStorage', () => {
    localStorage.setItem('nombre', 'Admin Test');
    localStorage.setItem('rol', 'administrador');
    component.ngOnInit();
    flushInit();
    expect(component.nombre).toBe('Admin Test');
    expect(component.rol).toBe('administrador');
    expect(component.esTerapeuta).toBe(false);
  });

  it('debe asignar esTerapeuta true cuando rol es terapeuta', () => {
    localStorage.setItem('rol', 'terapeuta');
    component.ngOnInit();
    flushInit();
    expect(component.esTerapeuta).toBe(true);
  });

  it('cargarUsuarios debe cargar solo terapeutas activos', () => {
    const mockUsuarios = [
      { id: 1, nombre: 'Maria', correo: 'm@test.com', rol: 'terapeuta', estado: 'activo' },
      { id: 2, nombre: 'Juan', correo: 'j@test.com', rol: 'cliente', estado: 'activo' },
      { id: 3, nombre: 'Pedro', correo: 'p@test.com', rol: 'terapeuta', estado: 'inactivo' }
    ];
    component.cargarUsuarios();
    httpMock.expectOne(`${environment.apiUrl}/usuarios`).flush(mockUsuarios);
    expect(component.terapeutas.length).toBe(1);
    expect(component.terapeutas[0].nombre).toBe('Maria');
    expect(component.terapeutas[0].id).toBe(1);
  });

  it('cargarServicios debe cargar solo servicios activos', () => {
    const mockServicios = [
      { idServicio: 1, nombre: 'Masaje', descripcion: '', precio: 100, duracionMinutos: 60, estado: 'activo' },
      { idServicio: 2, nombre: 'Facial', descripcion: '', precio: 80, duracionMinutos: 45, estado: 'inactivo' }
    ];
    component.cargarServicios();
    httpMock.expectOne(`${environment.apiUrl}/servicios`).flush(mockServicios);
    expect(component.todosServicios.length).toBe(1);
  });

  it('cargarReservasSemana debe cargar reservas y actualizar pulse', () => {
    const hoy = new Date();
    const fechaHoy = `${hoy.getFullYear()}-${String(hoy.getMonth()+1).padStart(2,'0')}-${String(hoy.getDate()).padStart(2,'0')}`;
    component.cargarReservasSemana();
    httpMock.expectOne(req => req.url.includes('reservas/filtrar')).flush([mockReserva(fechaHoy)]);
    expect(component.todasReservas.length).toBe(1);
    expect(component.pulse.citasHoy).toBe(1);
  });

  it('cargarReservasSemana debe incluir filtros en URL', () => {
    component.filtroTerapeuta = 1;
    component.filtroEstado = 'confirmada';
    component.cargarReservasSemana();
    const req = httpMock.expectOne(req => req.url.includes('idTerapeuta') && req.url.includes('estado'));
    req.flush([]);
    expect(req.request.url).toContain('idTerapeuta=1');
    expect(req.request.url).toContain('estado=confirmada');
  });

  it('onFiltroChange debe llamar cargarReservasSemana', () => {
    component.onFiltroChange();
    httpMock.expectOne(req => req.url.includes('reservas/filtrar')).flush([]);
    expect(component.todasReservas).toBeDefined();
  });

  it('semanaAnterior debe retroceder 7 dias y recargar', () => {
    const lunesOriginal = new Date(component['lunesActual']);
    component.semanaAnterior();
    httpMock.expectOne(req => req.url.includes('reservas/filtrar')).flush([]);
    const diff = lunesOriginal.getTime() - component['lunesActual'].getTime();
    expect(diff).toBe(7 * 24 * 60 * 60 * 1000);
  });

  it('semanaSiguiente debe avanzar 7 dias y recargar', () => {
    const lunesOriginal = new Date(component['lunesActual']);
    component.semanaSiguiente();
    httpMock.expectOne(req => req.url.includes('reservas/filtrar')).flush([]);
    const diff = component['lunesActual'].getTime() - lunesOriginal.getTime();
    expect(diff).toBe(7 * 24 * 60 * 60 * 1000);
  });

  it('generarSemana debe crear 7 dias', () => {
    component.generarSemana();
    expect(component.diasSemana.length).toBe(7);
  });

  it('generarSemana debe generar semanaLabel correctamente', () => {
    component.generarSemana();
    expect(component.semanaLabel).toBeTruthy();
    expect(component.semanaLabel.length).toBeGreaterThan(0);
  });

  it('esHoy debe retornar true para la fecha actual', () => {
    expect(component.esHoy(new Date())).toBe(true);
  });

  it('esHoy debe retornar false para otra fecha', () => {
    const ayer = new Date();
    ayer.setDate(ayer.getDate() - 1);
    expect(component.esHoy(ayer)).toBe(false);
  });

  it('esSemanaActual debe retornar true si hoy esta en la semana', () => {
    component.generarSemana();
    expect(component.esSemanaActual()).toBe(true);
  });

  it('getTop debe calcular posicion correctamente', () => {
    expect(component.getTop('07:00:00')).toBe(0);
    expect(component.getTop('08:00:00')).toBe(60);
    expect(component.getTop('09:30:00')).toBe(150);
  });

  it('getAltura debe calcular altura minima de 30px', () => {
    expect(component.getAltura('09:00:00', '09:00:00')).toBe(30);
  });

  it('getAltura debe calcular altura de 60 minutos correctamente', () => {
    expect(component.getAltura('09:00:00', '10:00:00')).toBe(60);
  });

  it('getAltura debe calcular altura de 90 minutos correctamente', () => {
    expect(component.getAltura('09:00:00', '10:30:00')).toBe(90);
  });

  it('getColorTerapeuta debe retornar color por defecto si no existe', () => {
    expect(component.getColorTerapeuta(999)).toBe('#e3c190');
  });

  it('getColorFondo debe agregar transparencia al color', () => {
    const color = component.getColorFondo(999);
    expect(color).toContain('22');
  });

  it('getReservasDia debe retornar reservas del dia', () => {
    component.todasReservas = [mockReserva('2026-01-15') as any];
    const resultado = component.getReservasDia(new Date(2026, 0, 15));
    expect(resultado.length).toBe(1);
  });

  it('contarCitasDia debe retornar cantidad de citas', () => {
    component.todasReservas = [mockReserva('2026-01-15') as any];
    expect(component.contarCitasDia(new Date(2026, 0, 15))).toBe(1);
  });

  it('getLineaHoraActual debe retornar numero mayor o igual a 0', () => {
    expect(component.getLineaHoraActual()).toBeGreaterThanOrEqual(0);
  });

  it('actualizarPulse debe calcular citasHoy correctamente', () => {
    const hoy = new Date();
    const fechaHoy = `${hoy.getFullYear()}-${String(hoy.getMonth()+1).padStart(2,'0')}-${String(hoy.getDate()).padStart(2,'0')}`;
    component.todasReservas = [mockReserva(fechaHoy) as any];
    component.actualizarPulse();
    expect(component.pulse.citasHoy).toBe(1);
    expect(component.pulse.citasSemana).toBe(1);
    expect(component.pulse.ingresosSemana).toContain('$');
  });

  it('actualizarPulse debe ignorar reservas canceladas', () => {
    const hoy = new Date();
    const fechaHoy = `${hoy.getFullYear()}-${String(hoy.getMonth()+1).padStart(2,'0')}-${String(hoy.getDate()).padStart(2,'0')}`;
    component.todasReservas = [mockReserva(fechaHoy, 'cancelada') as any];
    component.actualizarPulse();
    expect(component.pulse.citasHoy).toBe(0);
  });

  it('mostrarTooltip debe asignar tooltipReserva y coordenadas', () => {
    const reserva: any = { idReserva: 1 };
    const event = { clientX: 100, clientY: 200 } as MouseEvent;
    component.mostrarTooltip(event, reserva);
    expect(component.tooltipReserva).toEqual(reserva);
    expect(component.tooltipX).toBe(112);
    expect(component.tooltipY).toBe(212);
  });

  it('ocultarTooltip debe limpiar tooltipReserva', () => {
    component.tooltipReserva = {} as any;
    component.ocultarTooltip();
    expect(component.tooltipReserva).toBeNull();
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

  it('estaSeleccionado debe retornar true y false correctamente', () => {
    component.serviciosSeleccionados = [1, 2];
    expect(component.estaSeleccionado(1)).toBe(true);
    expect(component.estaSeleccionado(3)).toBe(false);
  });

  it('abrirEditModal debe configurar formulario y abrir modal', () => {
    const reserva: any = { idReserva: 1, fecha: '2026-06-15', horaInicio: '09:00:00', idTerapeuta: 1, estado: 'confirmada', idServicios: [1], nombresServicios: ['Masaje'] };
    const event = { stopPropagation: vi.fn() } as any;
    component.abrirEditModal(reserva, event);
    expect(component.showEditModal).toBe(true);
    expect(component.editForm.fecha).toBe('2026-06-15');
    expect(component.editForm.horaInicio).toBe('09:00');
    expect(component.editForm.estado).toBe('confirmada');
  });

  it('cerrarEditModal debe resetear estado', () => {
    component.showEditModal = true;
    component.isSubmitting = true;
    component.cerrarEditModal();
    expect(component.showEditModal).toBe(false);
    expect(component.isSubmitting).toBe(false);
  });

  it('guardarCambios debe hacer PATCH y cerrar modal', () => {
    component.reservaEditando = { idReserva: 1 } as any;
    component.editForm = { fecha: '2026-06-15', horaInicio: '09:00', idTerapeuta: 1, estado: 'confirmada' };
    component.guardarCambios();
    httpMock.expectOne(req => req.url.includes('reservas/1/estado')).flush({});
    httpMock.expectOne(req => req.url.includes('reservas/filtrar')).flush([]);
    expect(component.showEditModal).toBe(false);
  });

  it('guardarCambios debe manejar error', () => {
    component.reservaEditando = { idReserva: 1 } as any;
    component.editForm = { fecha: '2026-06-15', horaInicio: '09:00', idTerapeuta: 1, estado: 'confirmada' };
    component.guardarCambios();
    httpMock.expectOne(req => req.url.includes('reservas/1/estado')).flush('error', { status: 500, statusText: 'Server Error' });
    expect(component.isSubmitting).toBe(false);
  });

  it('guardarCambios no ejecuta si reservaEditando es null', () => {
    component.reservaEditando = null;
    component.guardarCambios();
    httpMock.expectNone(req => req.url.includes('estado'));
  });

  it('guardarCambios no ejecuta si isSubmitting es true', () => {
    component.reservaEditando = { idReserva: 1 } as any;
    component.isSubmitting = true;
    component.guardarCambios();
    httpMock.expectNone(req => req.url.includes('estado'));
  });

  it('abrirEditServicios debe cargar servicios del reservaEditando', () => {
    component.reservaEditando = { idReserva: 1, idServicios: [1, 2], nombresServicios: ['Masaje', 'Facial'] } as any;
    const event = { stopPropagation: vi.fn() } as any;
    component.abrirEditServicios(event);
    expect(component.showEditServiciosModal).toBe(true);
    expect(component.serviciosSeleccionados).toEqual([1, 2]);
  });

  it('abrirEditServicios no debe abrir si reservaEditando es null', () => {
    component.reservaEditando = null;
    const event = { stopPropagation: vi.fn() } as any;
    component.abrirEditServicios(event);
    expect(component.showEditServiciosModal).toBe(false);
  });

  it('cerrarEditServicios debe limpiar servicios seleccionados', () => {
    component.serviciosSeleccionados = [1, 2, 3];
    component.showEditServiciosModal = true;
    component.cerrarEditServicios();
    expect(component.showEditServiciosModal).toBe(false);
    expect(component.serviciosSeleccionados.length).toBe(0);
  });

  it('guardarServicios debe hacer PATCH y cerrar modales', () => {
    component.reservaEditando = { idReserva: 1 } as any;
    component.serviciosSeleccionados = [1, 2];
    component.guardarServicios();
    httpMock.expectOne(req => req.url.includes('reservas/1/servicios')).flush({});
    httpMock.expectOne(req => req.url.includes('reservas/filtrar')).flush([]);
    expect(component.showEditServiciosModal).toBe(false);
    expect(component.showEditModal).toBe(false);
  });

  it('guardarServicios no ejecuta si serviciosSeleccionados esta vacio', () => {
    component.reservaEditando = { idReserva: 1 } as any;
    component.serviciosSeleccionados = [];
    component.guardarServicios();
    httpMock.expectNone(req => req.url.includes('servicios'));
  });

  it('guardarServicios debe manejar error', () => {
    component.reservaEditando = { idReserva: 1 } as any;
    component.serviciosSeleccionados = [1];
    component.guardarServicios();
    httpMock.expectOne(req => req.url.includes('reservas/1/servicios')).flush('error', { status: 500, statusText: 'Server Error' });
    expect(component.isSubmittingServicios).toBe(false);
  });

  it('clickSlotVacio no debe navegar si es terapeuta', () => {
    const spy = vi.spyOn(router, 'navigate').mockResolvedValue(true);
    component.esTerapeuta = true;
    component.clickSlotVacio(new Date(), 9);
    expect(spy).not.toHaveBeenCalled();
  });

  it('clickSlotVacio debe navegar a admin reservas si es admin', () => {
    const spy = vi.spyOn(router, 'navigate').mockResolvedValue(true);
    component.esTerapeuta = false;
    component.rol = 'administrador';
    component.clickSlotVacio(new Date(), 9);
    expect(spy).toHaveBeenCalledWith(['/dashboard/admin/reservas'], expect.any(Object));
  });

  it('clickSlotVacio debe navegar a recepcionista reservas si es recepcionista', () => {
    const spy = vi.spyOn(router, 'navigate').mockResolvedValue(true);
    component.esTerapeuta = false;
    component.rol = 'recepcionista';
    component.clickSlotVacio(new Date(), 9);
    expect(spy).toHaveBeenCalledWith(['/dashboard/recepcionista/reservas'], expect.any(Object));
  });

  it('cerrarSesion debe limpiar localStorage y navegar al login', () => {
    const spy = vi.spyOn(router, 'navigate').mockResolvedValue(true);
    localStorage.setItem('token', 'fake-token');
    component.cerrarSesion();
    expect(localStorage.getItem('token')).toBeNull();
    expect(spy).toHaveBeenCalledWith(['/login']);
  });
});