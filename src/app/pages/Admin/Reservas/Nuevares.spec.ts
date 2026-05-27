import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { vi } from 'vitest';
import { ReservasComponent } from './Nuevares';
import { environment } from 'environments/environment';

describe('ReservasComponent', () => {
  let component: ReservasComponent;
  let router: Router;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReservasComponent],
      providers: [
        provideRouter([{ path: '**', redirectTo: '' }]),
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    }).compileComponents();

    const fixture = TestBed.createComponent(ReservasComponent);
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

  it('debe detectar rol cliente correctamente', () => {
    localStorage.setItem('rol', 'cliente');
    component.ngOnInit();
    httpMock.expectOne(`${environment.apiUrl}/servicios`).flush([]);
    expect(component.esCliente).toBe(true);
  });

  it('debe detectar rol admin correctamente', () => {
    localStorage.setItem('rol', 'administrador');
    component.ngOnInit();
    httpMock.expectOne(`${environment.apiUrl}/servicios`).flush([]);
    httpMock.expectOne(`${environment.apiUrl}/usuarios`).flush([]);
    expect(component.esCliente).toBe(false);
  });

  it('cargarServicios debe cargar solo servicios activos', () => {
    const mockServicios = [
      { idServicio: 1, nombre: 'Masaje', descripcion: '', precio: 100, duracionMinutos: 60, estado: 'activo' },
      { idServicio: 2, nombre: 'Facial', descripcion: '', precio: 80, duracionMinutos: 45, estado: 'inactivo' }
    ];
    component.cargarServicios();
    httpMock.expectOne(`${environment.apiUrl}/servicios`).flush(mockServicios);
    expect(component.servicios.length).toBe(1);
    expect(component.serviciosFiltrados.length).toBe(1);
  });

  it('cargarServicios debe mostrar toast en error', () => {
    component.cargarServicios();
    httpMock.expectOne(`${environment.apiUrl}/servicios`).flush('error', { status: 500, statusText: 'Server Error' });
    expect(component.toasts.length).toBe(1);
  });

  it('cargarTerapeutas debe cargar solo terapeutas activos', () => {
    const mockUsuarios = [
      { id: 1, nombre: 'Maria', correo: 'maria@test.com', rol: 'terapeuta', estado: 'activo' },
      { id: 2, nombre: 'Juan', correo: 'juan@test.com', rol: 'cliente', estado: 'activo' }
    ];
    component.cargarTerapeutas();
    httpMock.expectOne(`${environment.apiUrl}/usuarios`).flush(mockUsuarios);
    expect(component.terapeutas.length).toBe(1);
    expect(component.terapeutas[0].nombre).toBe('Maria');
  });

  it('cargarTerapeutas debe mostrar toast en error', () => {
    component.cargarTerapeutas();
    httpMock.expectOne(`${environment.apiUrl}/usuarios`).flush('error', { status: 500, statusText: 'Server Error' });
    expect(component.toasts.length).toBe(1);
  });

  it('cargarReservas cliente debe usar endpoint mis-reservas', () => {
    component.esCliente = true;
    component.cargarReservas();
    const req = httpMock.expectOne(`${environment.apiUrl}/reservas/mis-reservas`);
    req.flush([]);
    expect(component.reservas.length).toBe(0);
  });

  it('cargarReservas admin debe usar endpoint reservas', () => {
    component.esCliente = false;
    component.cargarReservas();
    const req = httpMock.expectOne(`${environment.apiUrl}/reservas`);
    req.flush([]);
    expect(component.reservas.length).toBe(0);
  });

  it('cargarReservas debe mostrar toast en error', () => {
    component.esCliente = true;
    component.cargarReservas();
    httpMock.expectOne(`${environment.apiUrl}/reservas/mis-reservas`).flush('error', { status: 500, statusText: 'Server Error' });
    expect(component.toasts.length).toBe(1);
  });

  it('confirmarReservaAdmin debe hacer POST y navegar', () => {
    const spy = vi.spyOn(router, 'navigate').mockResolvedValue(true);
    component.esCliente = false;
    component.rol = 'administrador';
    component.clienteSeleccionado = { id: 1, nombre: 'Juan', correo: 'j@test.com', rol: 'cliente', estado: 'activo' };
    component.terapeutaSeleccionado = { id: 2, nombre: 'Maria', correo: 'm@test.com', rol: 'terapeuta', estado: 'activo' };
    component.serviciosSeleccionados = [{ idServicio: 1, nombre: 'Masaje', descripcion: '', precio: 100, duracionMinutos: 60, estado: 'activo' }];
    component.fechaSeleccionada = new Date(2026, 0, 15);
    component.horaSeleccionada = '09:00:00';

    component.confirmarReservaAdmin();
    const req = httpMock.expectOne(`${environment.apiUrl}/reservas`);
    req.flush({});
    expect(component.toasts.length).toBe(1);
  });

  it('confirmarReservaAdmin debe mostrar toast en error', () => {
    component.clienteSeleccionado = { id: 1, nombre: 'Juan', correo: 'j@test.com', rol: 'cliente', estado: 'activo' };
    component.terapeutaSeleccionado = { id: 2, nombre: 'Maria', correo: 'm@test.com', rol: 'terapeuta', estado: 'activo' };
    component.serviciosSeleccionados = [{ idServicio: 1, nombre: 'Masaje', descripcion: '', precio: 100, duracionMinutos: 60, estado: 'activo' }];
    component.fechaSeleccionada = new Date(2026, 0, 15);
    component.horaSeleccionada = '09:00:00';

    component.confirmarReservaAdmin();
    httpMock.expectOne(`${environment.apiUrl}/reservas`).flush({ message: 'Error' }, { status: 400, statusText: 'Bad Request' });
    expect(component.toasts.length).toBe(1);
    expect(component.isSubmitting).toBe(false);
  });

  it('confirmarReservaCliente debe hacer GET disponibilidad y POST reserva', () => {
    component.esCliente = true;
    component.serviciosSeleccionados = [{ idServicio: 1, nombre: 'Masaje', descripcion: '', precio: 100, duracionMinutos: 60, estado: 'activo' }];
    component.fechaSeleccionada = new Date(2026, 0, 15);
    component.horaSeleccionada = '09:00:00';

    component.confirmarReservaCliente();
    const reqDisp = httpMock.expectOne(req => req.url.includes('terapeuta-disponible'));
    reqDisp.flush({ idTerapeuta: 1 });
    const reqReserva = httpMock.expectOne(`${environment.apiUrl}/reservas`);
    reqReserva.flush({});
    expect(component.toasts.length).toBe(1);
  });

  it('confirmarReservaCliente debe mostrar mensaje si no hay terapeutas', () => {
    component.esCliente = true;
    component.serviciosSeleccionados = [{ idServicio: 1, nombre: 'Masaje', descripcion: '', precio: 100, duracionMinutos: 60, estado: 'activo' }];
    component.fechaSeleccionada = new Date(2026, 0, 15);
    component.horaSeleccionada = '09:00:00';

    component.confirmarReservaCliente();
    httpMock.expectOne(req => req.url.includes('terapeuta-disponible')).flush('', { status: 404, statusText: 'Not Found' });
    expect(component.mensajeDisponibilidad).toContain('No hay terapeutas disponibles');
  });

  it('seleccionarServicio debe agregar servicio si no esta seleccionado', () => {
    const s = { idServicio: 1, nombre: 'Masaje', descripcion: '', precio: 100, duracionMinutos: 60, estado: 'activo' };
    component.seleccionarServicio(s);
    expect(component.serviciosSeleccionados.length).toBe(1);
  });

  it('seleccionarServicio debe quitar servicio si ya esta seleccionado', () => {
    const s = { idServicio: 1, nombre: 'Masaje', descripcion: '', precio: 100, duracionMinutos: 60, estado: 'activo' };
    component.serviciosSeleccionados = [s];
    component.seleccionarServicio(s);
    expect(component.serviciosSeleccionados.length).toBe(0);
  });

  it('estaSeleccionado debe retornar true si servicio esta en lista', () => {
    const s = { idServicio: 1, nombre: 'Masaje', descripcion: '', precio: 100, duracionMinutos: 60, estado: 'activo' };
    component.serviciosSeleccionados = [s];
    expect(component.estaSeleccionado(s)).toBe(true);
  });

  it('estaSeleccionado debe retornar false si servicio no esta en lista', () => {
    const s = { idServicio: 1, nombre: 'Masaje', descripcion: '', precio: 100, duracionMinutos: 60, estado: 'activo' };
    expect(component.estaSeleccionado(s)).toBe(false);
  });

  it('duracionTotal debe sumar duraciones de servicios seleccionados', () => {
    component.serviciosSeleccionados = [
      { idServicio: 1, nombre: 'Masaje', descripcion: '', precio: 100, duracionMinutos: 60, estado: 'activo' },
      { idServicio: 2, nombre: 'Facial', descripcion: '', precio: 80, duracionMinutos: 45, estado: 'activo' }
    ];
    expect(component.duracionTotal).toBe(105);
  });

  it('calcularSubtotal debe sumar precios de servicios seleccionados', () => {
    component.serviciosSeleccionados = [
      { idServicio: 1, nombre: 'Masaje', descripcion: '', precio: 100000, duracionMinutos: 60, estado: 'activo' },
      { idServicio: 2, nombre: 'Facial', descripcion: '', precio: 80000, duracionMinutos: 45, estado: 'activo' }
    ];
    expect(component.calcularSubtotal()).toBe(180000);
  });

  it('puedeConfirmar debe retornar false si no hay servicios seleccionados', () => {
    component.serviciosSeleccionados = [];
    expect(component.puedeConfirmar()).toBe(false);
  });

  it('puedeConfirmar cliente debe retornar true con datos completos', () => {
    component.esCliente = true;
    component.serviciosSeleccionados = [{ idServicio: 1, nombre: 'Masaje', descripcion: '', precio: 100, duracionMinutos: 60, estado: 'activo' }];
    component.fechaSeleccionada = new Date();
    component.horaSeleccionada = '09:00:00';
    expect(component.puedeConfirmar()).toBe(true);
  });

  it('puedeConfirmar admin debe retornar false sin terapeuta', () => {
    component.esCliente = false;
    component.serviciosSeleccionados = [{ idServicio: 1, nombre: 'Masaje', descripcion: '', precio: 100, duracionMinutos: 60, estado: 'activo' }];
    component.fechaSeleccionada = new Date();
    component.horaSeleccionada = '09:00:00';
    component.terapeutaSeleccionado = null;
    expect(component.puedeConfirmar()).toBe(false);
  });

  it('generarCalendario debe generar dias del mes', () => {
    component.mesActual = new Date(2026, 0, 1);
    component.generarCalendario();
    const diasNoNulos = component.diasCalendario.filter(d => d !== null);
    expect(diasNoNulos.length).toBe(31);
  });

  it('esFechaSeleccionada debe retornar true para la fecha correcta', () => {
    const fecha = new Date(2026, 0, 15);
    component.fechaSeleccionada = fecha;
    expect(component.esFechaSeleccionada(fecha)).toBe(true);
  });

  it('esFechaSeleccionada debe retornar false si no hay fecha seleccionada', () => {
    component.fechaSeleccionada = null;
    expect(component.esFechaSeleccionada(new Date())).toBe(false);
  });

  it('getFechaFormateada debe retornar string vacio si no hay fecha', () => {
    component.fechaSeleccionada = null;
    expect(component.getFechaFormateada()).toBe('');
  });

  it('getFechaFormateada debe formatear fecha correctamente', () => {
    component.fechaSeleccionada = new Date(2026, 0, 15);
    expect(component.getFechaFormateada()).toBe('2026-01-15');
  });

  it('horaFinal debe retornar horaSeleccionada si no usa hora manual', () => {
    component.usarHoraManual = false;
    component.horaSeleccionada = '09:00:00';
    expect(component.horaFinal).toBe('09:00:00');
  });

  it('horaFinal debe retornar horaManual con segundos si usa hora manual', () => {
    component.usarHoraManual = true;
    component.horaManual = '10:30';
    expect(component.horaFinal).toBe('10:30:00');
  });

  it('resetForm debe limpiar todos los campos', () => {
    component.serviciosSeleccionados = [{ idServicio: 1, nombre: 'Masaje', descripcion: '', precio: 100, duracionMinutos: 60, estado: 'activo' }];
    component.fechaSeleccionada = new Date();
    component.horaSeleccionada = '09:00:00';
    component.resetForm();
    expect(component.serviciosSeleccionados.length).toBe(0);
    expect(component.fechaSeleccionada).toBeNull();
    expect(component.horaSeleccionada).toBe('');
  });

  it('generarSemana debe crear 7 dias', () => {
    component.generarSemana();
    expect(component.diasSemana.length).toBe(7);
  });

  it('esHoy debe retornar true para la fecha actual', () => {
    expect(component.esHoy(new Date())).toBe(true);
  });

  it('esHoy debe retornar false para otra fecha', () => {
    const ayer = new Date();
    ayer.setDate(ayer.getDate() - 1);
    expect(component.esHoy(ayer)).toBe(false);
  });

  it('showToast debe agregar toast a la lista', () => {
    component.showToast('Test', 'success');
    expect(component.toasts.length).toBe(1);
  });

  it('filtrarServicios debe filtrar por query', () => {
    component.servicios = [
      { idServicio: 1, nombre: 'Masaje Relajante', descripcion: '', precio: 100, duracionMinutos: 60, estado: 'activo' },
      { idServicio: 2, nombre: 'Facial', descripcion: '', precio: 80, duracionMinutos: 45, estado: 'activo' }
    ];
    component.searchQuery = 'masaje';
    component.filtrarServicios();
    expect(component.serviciosFiltrados.length).toBe(1);
  });

  it('limpiarBusqueda debe resetear serviciosFiltrados', () => {
    component.servicios = [{ idServicio: 1, nombre: 'Masaje', descripcion: '', precio: 100, duracionMinutos: 60, estado: 'activo' }];
    component.searchQuery = 'masaje';
    component.limpiarBusqueda();
    expect(component.searchQuery).toBe('');
    expect(component.serviciosFiltrados.length).toBe(1);
  });

  it('elegirCliente debe asignar cliente seleccionado', () => {
    const u = { id: 1, nombre: 'Juan', correo: 'juan@test.com', rol: 'cliente', estado: 'activo' };
    component.elegirCliente(u);
    expect(component.clienteSeleccionado).toEqual(u);
    expect(component.clienteBusqueda).toBe('Juan');
  });

  it('limpiarCliente debe resetear cliente', () => {
    component.clienteSeleccionado = { id: 1, nombre: 'Juan', correo: 'juan@test.com', rol: 'cliente', estado: 'activo' };
    component.limpiarCliente();
    expect(component.clienteSeleccionado).toBeNull();
    expect(component.clienteBusqueda).toBe('');
  });

  it('seleccionarTerapeuta debe asignar terapeuta', () => {
    const t = { id: 2, nombre: 'Maria', correo: 'maria@test.com', rol: 'terapeuta', estado: 'activo' };
    component.seleccionarTerapeuta(t);
    expect(component.terapeutaSeleccionado).toEqual(t);
  });

  it('cerrarCalendario debe cerrar el modal', () => {
    component.mostrarCalendario = true;
    component.cerrarCalendario();
    expect(component.mostrarCalendario).toBe(false);
  });

  it('mesAnterior debe retroceder un mes', () => {
    component.mesActual = new Date(2026, 5, 1);
    component.mesAnterior();
    expect(component.mesActual.getMonth()).toBe(4);
  });

  it('mesSiguiente debe avanzar un mes', () => {
    component.mesActual = new Date(2026, 5, 1);
    component.mesSiguiente();
    expect(component.mesActual.getMonth()).toBe(6);
  });

  it('esPasado debe retornar true para fecha pasada', () => {
    const ayer = new Date();
    ayer.setDate(ayer.getDate() - 1);
    expect(component.esPasado(ayer)).toBe(true);
  });

  it('formatFecha debe formatear fecha correctamente', () => {
    expect(component.formatFecha(new Date(2026, 0, 15))).toBe('2026-01-15');
  });

  it('getReservasDia debe retornar reservas del dia', () => {
    component.reservas = [{ idReserva: 1, fecha: '2026-01-15' } as any];
    const resultado = component.getReservasDia(new Date(2026, 0, 15));
    expect(resultado.length).toBe(1);
  });

  it('getSemanaLabel debe retornar string con rango de fechas', () => {
    component.generarSemana();
    expect(component.getSemanaLabel()).not.toBe('');
  });

  it('semanaAnterior debe retroceder 7 dias', () => {
    const fechaInicial = new Date(component.semanaActual);
    component.semanaAnterior();
    const diff = fechaInicial.getTime() - component.semanaActual.getTime();
    expect(diff).toBe(7 * 24 * 60 * 60 * 1000);
  });

  it('semanaSiguiente debe avanzar 7 dias', () => {
    const fechaInicial = new Date(component.semanaActual);
    component.semanaSiguiente();
    const diff = component.semanaActual.getTime() - fechaInicial.getTime();
    expect(diff).toBe(7 * 24 * 60 * 60 * 1000);
  });

  it('getTopOffset debe calcular offset correctamente', () => {
    expect(component.getTopOffset('08:00')).toBe(0);
    expect(component.getTopOffset('09:00')).toBeGreaterThan(0);
  });

  it('getAltura debe calcular altura correctamente', () => {
    expect(component.getAltura('09:00', '10:00')).toBeGreaterThan(0);
  });

  it('getNombreDia debe retornar nombre del dia', () => {
    const lunes = new Date(2026, 0, 5);
    expect(component.getNombreDia(lunes)).toBe('Lun');
  });
});