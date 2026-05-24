import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { vi } from 'vitest';
import { Agendaadmi } from './Agendaadmi';

describe('Agendaadmi', () => {
  let component: Agendaadmi;
  let router: Router;

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
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('debe leer nombre y rol desde localStorage', () => {
    localStorage.setItem('nombre', 'Admin Test');
    localStorage.setItem('rol', 'administrador');
    localStorage.setItem('token', 'fake-token');
    component.ngOnInit();
    expect(component.nombre).toBe('Admin Test');
    expect(component.rol).toBe('administrador');
    expect(component.esTerapeuta).toBe(false);
  });

  it('debe asignar esTerapeuta true cuando rol es terapeuta', () => {
    localStorage.setItem('rol', 'terapeuta');
    localStorage.setItem('token', 'fake-token');
    component.ngOnInit();
    expect(component.esTerapeuta).toBe(true);
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
    const hoy = new Date();
    expect(component.esHoy(hoy)).toBe(true);
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
  });

  it('getAltura debe calcular altura minima de 30px', () => {
    expect(component.getAltura('09:00:00', '09:00:00')).toBe(30);
  });

  it('getAltura debe calcular altura de 60 minutos correctamente', () => {
    expect(component.getAltura('09:00:00', '10:00:00')).toBe(60);
  });

  it('getColorTerapeuta debe retornar color por defecto si no existe', () => {
    expect(component.getColorTerapeuta(999)).toBe('#e3c190');
  });

  it('getColorFondo debe agregar transparencia al color', () => {
    const color = component.getColorFondo(999);
    expect(color).toContain('22');
  });

  it('actualizarPulse debe calcular citasHoy correctamente', () => {
    const hoy = new Date();
    const fechaHoy = `${hoy.getFullYear()}-${String(hoy.getMonth()+1).padStart(2,'0')}-${String(hoy.getDate()).padStart(2,'0')}`;
    component.todasReservas = [
      { idReserva: 1, idCliente: 1, nombreCliente: 'Test', idServicios: [1],
        nombresServicios: ['Test'], idTerapeuta: 1, nombreTerapeuta: 'T1',
        fecha: fechaHoy, horaInicio: '09:00', horaFin: '10:00',
        estado: 'confirmada', totalServicios: 100000 }
    ];
    component.actualizarPulse();
    expect(component.pulse.citasHoy).toBe(1);
  });

  it('actualizarPulse debe ignorar reservas canceladas', () => {
    const hoy = new Date();
    const fechaHoy = `${hoy.getFullYear()}-${String(hoy.getMonth()+1).padStart(2,'0')}-${String(hoy.getDate()).padStart(2,'0')}`;
    component.todasReservas = [
      { idReserva: 1, idCliente: 1, nombreCliente: 'Test', idServicios: [1],
        nombresServicios: ['Test'], idTerapeuta: 1, nombreTerapeuta: 'T1',
        fecha: fechaHoy, horaInicio: '09:00', horaFin: '10:00',
        estado: 'cancelada', totalServicios: 100000 }
    ];
    component.actualizarPulse();
    expect(component.pulse.citasHoy).toBe(0);
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

  it('estaSeleccionado debe retornar true si servicio esta en lista', () => {
    component.serviciosSeleccionados = [1, 2];
    expect(component.estaSeleccionado(1)).toBe(true);
    expect(component.estaSeleccionado(3)).toBe(false);
  });

  it('cerrarEditModal debe resetear estado', () => {
    component.showEditModal = true;
    component.isSubmitting = true;
    component.cerrarEditModal();
    expect(component.showEditModal).toBe(false);
    expect(component.isSubmitting).toBe(false);
  });

  it('cerrarEditServicios debe limpiar servicios seleccionados', () => {
    component.serviciosSeleccionados = [1, 2, 3];
    component.showEditServiciosModal = true;
    component.cerrarEditServicios();
    expect(component.showEditServiciosModal).toBe(false);
    expect(component.serviciosSeleccionados.length).toBe(0);
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

  it('ocultarTooltip debe limpiar tooltipReserva', () => {
    component.tooltipReserva = {} as any;
    component.ocultarTooltip();
    expect(component.tooltipReserva).toBeNull();
  });
});