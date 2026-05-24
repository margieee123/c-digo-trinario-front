import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { FacturacionComponent } from './Facturacion';

describe('FacturacionComponent', () => {
  let component: FacturacionComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FacturacionComponent],
      providers: [
        provideRouter([{ path: '**', redirectTo: '' }]),
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    }).compileComponents();

    const fixture = TestBed.createComponent(FacturacionComponent);
    component = fixture.componentInstance;
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('debe iniciar con facturas vacias', () => {
    expect(component.facturas.length).toBe(0);
    expect(component.facturasFiltradas.length).toBe(0);
  });

  it('debe iniciar KPIs en cero', () => {
    expect(component.totalFacturado).toBe(0);
    expect(component.totalPendiente).toBe(0);
    expect(component.totalPagado).toBe(0);
    expect(component.cantidadFacturas).toBe(0);
  });

  it('calcularKpis debe calcular totales correctamente', () => {
    component.facturas = [
      { idFactura: 1, idReserva: 1, monto: 100000, fechaEmision: '2026-01-01',
        estadoPago: 'pendiente', nombreCliente: 'Cliente 1', nombreTerapeuta: 'T1',
        fechaReserva: '2026-01-01', horaInicio: '09:00', horaFin: '10:00',
        nombresServicios: ['Masaje'], estadoReserva: 'finalizada' },
      { idFactura: 2, idReserva: 2, monto: 80000, fechaEmision: '2026-01-02',
        estadoPago: 'pagado', nombreCliente: 'Cliente 2', nombreTerapeuta: 'T2',
        fechaReserva: '2026-01-02', horaInicio: '10:00', horaFin: '11:00',
        nombresServicios: ['Facial'], estadoReserva: 'finalizada' }
    ];
    component.calcularKpis();
    expect(component.cantidadFacturas).toBe(2);
    expect(component.totalFacturado).toBe(180000);
    expect(component.totalPendiente).toBe(100000);
    expect(component.totalPagado).toBe(80000);
  });

  it('aplicarFiltros debe filtrar por estado', () => {
    component.facturas = [
      { idFactura: 1, idReserva: 1, monto: 100000, fechaEmision: '2026-01-01',
        estadoPago: 'pendiente', nombreCliente: 'Cliente 1', nombreTerapeuta: 'T1',
        fechaReserva: '2026-01-01', horaInicio: '09:00', horaFin: '10:00',
        nombresServicios: ['Masaje'], estadoReserva: 'finalizada' },
      { idFactura: 2, idReserva: 2, monto: 80000, fechaEmision: '2026-01-02',
        estadoPago: 'pagado', nombreCliente: 'Cliente 2', nombreTerapeuta: 'T2',
        fechaReserva: '2026-01-02', horaInicio: '10:00', horaFin: '11:00',
        nombresServicios: ['Facial'], estadoReserva: 'finalizada' }
    ];
    component.filtroEstado = 'pendiente';
    component.aplicarFiltros();
    expect(component.facturasFiltradas.length).toBe(1);
    expect(component.facturasFiltradas[0].estadoPago).toBe('pendiente');
  });

  it('aplicarFiltros debe filtrar por busqueda de cliente', () => {
    component.facturas = [
      { idFactura: 1, idReserva: 1, monto: 100000, fechaEmision: '2026-01-01',
        estadoPago: 'pendiente', nombreCliente: 'Juan Perez', nombreTerapeuta: 'T1',
        fechaReserva: '2026-01-01', horaInicio: '09:00', horaFin: '10:00',
        nombresServicios: ['Masaje'], estadoReserva: 'finalizada' },
      { idFactura: 2, idReserva: 2, monto: 80000, fechaEmision: '2026-01-02',
        estadoPago: 'pagado', nombreCliente: 'Maria Lopez', nombreTerapeuta: 'T2',
        fechaReserva: '2026-01-02', horaInicio: '10:00', horaFin: '11:00',
        nombresServicios: ['Facial'], estadoReserva: 'finalizada' }
    ];
    component.busqueda = 'juan';
    component.aplicarFiltros();
    expect(component.facturasFiltradas.length).toBe(1);
    expect(component.facturasFiltradas[0].nombreCliente).toBe('Juan Perez');
  });

  it('aplicarFiltros sin filtros debe retornar todas las facturas', () => {
    component.facturas = [
      { idFactura: 1, idReserva: 1, monto: 100000, fechaEmision: '2026-01-01',
        estadoPago: 'pendiente', nombreCliente: 'Cliente 1', nombreTerapeuta: 'T1',
        fechaReserva: '2026-01-01', horaInicio: '09:00', horaFin: '10:00',
        nombresServicios: ['Masaje'], estadoReserva: 'finalizada' }
    ];
    component.filtroEstado = '';
    component.busqueda = '';
    component.aplicarFiltros();
    expect(component.facturasFiltradas.length).toBe(1);
  });

  it('abrirGenerarModal debe abrir modal', () => {
    component.abrirGenerarModal();
    expect(component.showGenerarModal).toBe(true);
    expect(component.reservaSeleccionada).toBeNull();
  });

  it('cerrarGenerarModal debe cerrar modal', () => {
    component.showGenerarModal = true;
    component.cerrarGenerarModal();
    expect(component.showGenerarModal).toBe(false);
    expect(component.isSubmitting).toBe(false);
  });

  it('seleccionarReserva debe asignar reserva seleccionada', () => {
    const r: any = { idReserva: 1, nombreCliente: 'Test' };
    component.seleccionarReserva(r);
    expect(component.reservaSeleccionada).toEqual(r);
  });

  it('toggleServicio debe agregar servicio si no esta seleccionado', () => {
    component.serviciosSeleccionados = [];
    component.toggleServicio(1);
    expect(component.serviciosSeleccionados).toContain(1);
  });

  it('toggleServicio debe quitar servicio si ya esta seleccionado', () => {
    component.serviciosSeleccionados = [1, 2];
    component.toggleServicio(1);
    expect(component.serviciosSeleccionados).not.toContain(1);
  });

  it('estaSeleccionado debe retornar true si servicio esta en lista', () => {
    component.serviciosSeleccionados = [1, 2];
    expect(component.estaSeleccionado(1)).toBe(true);
    expect(component.estaSeleccionado(3)).toBe(false);
  });

  it('cerrarEditServicios debe limpiar estado', () => {
    component.showEditServiciosModal = true;
    component.serviciosSeleccionados = [1, 2];
    component.cerrarEditServicios();
    expect(component.showEditServiciosModal).toBe(false);
    expect(component.serviciosSeleccionados.length).toBe(0);
  });

  it('abrirDetalle debe asignar facturaDetalle y abrir modal', () => {
    const factura: any = { idFactura: 1, estadoPago: 'pendiente' };
    component.abrirDetalle(factura);
    expect(component.showDetalleModal).toBe(true);
    expect(component.facturaDetalle).toEqual(factura);
  });

  it('cerrarDetalle debe cerrar modal', () => {
    component.showDetalleModal = true;
    component.cerrarDetalle();
    expect(component.showDetalleModal).toBe(false);
  });

  it('getEstadoClass debe retornar clase correcta para pendiente', () => {
    expect(component.getEstadoClass('pendiente')).toBe('estado--pendiente');
  });

  it('getEstadoClass debe retornar clase correcta para pagado', () => {
    expect(component.getEstadoClass('pagado')).toBe('estado--pagado');
  });

  it('getEstadoClass debe retornar string vacio para estado desconocido', () => {
    expect(component.getEstadoClass('desconocido')).toBe('');
  });

  it('getEstadoIcon debe retornar icono correcto para pendiente', () => {
    expect(component.getEstadoIcon('pendiente')).toBe('schedule');
  });

  it('getEstadoIcon debe retornar icono correcto para pagado', () => {
    expect(component.getEstadoIcon('pagado')).toBe('check_circle');
  });

  it('showToast debe agregar toast a la lista', () => {
    component.showToast('Test', 'success');
    expect(component.toasts.length).toBe(1);
    expect(component.toasts[0].type).toBe('success');
  });
});