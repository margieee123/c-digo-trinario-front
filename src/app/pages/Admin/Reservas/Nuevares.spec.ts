import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { vi } from 'vitest';
import { ReservasComponent } from './Nuevares';

describe('ReservasComponent', () => {
  let component: ReservasComponent;
  let router: Router;

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
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('debe detectar rol cliente correctamente', () => {
    localStorage.setItem('rol', 'cliente');
    component.ngOnInit();
    expect(component.esCliente).toBe(true);
  });

  it('debe detectar rol admin correctamente', () => {
    localStorage.setItem('rol', 'administrador');
    component.ngOnInit();
    expect(component.esCliente).toBe(false);
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
    component.serviciosSeleccionados = [
      { idServicio: 1, nombre: 'Masaje', descripcion: '', precio: 100, duracionMinutos: 60, estado: 'activo' }
    ];
    component.fechaSeleccionada = new Date();
    component.horaSeleccionada = '09:00:00';
    expect(component.puedeConfirmar()).toBe(true);
  });

  it('puedeConfirmar admin debe retornar false sin terapeuta', () => {
    component.esCliente = false;
    component.serviciosSeleccionados = [
      { idServicio: 1, nombre: 'Masaje', descripcion: '', precio: 100, duracionMinutos: 60, estado: 'activo' }
    ];
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
    component.serviciosSeleccionados = [
      { idServicio: 1, nombre: 'Masaje', descripcion: '', precio: 100, duracionMinutos: 60, estado: 'activo' }
    ];
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
    expect(component.toasts[0].message).toBe('Test');
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
    component.servicios = [
      { idServicio: 1, nombre: 'Masaje', descripcion: '', precio: 100, duracionMinutos: 60, estado: 'activo' }
    ];
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
});