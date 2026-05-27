import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { FacturacionComponent } from './Facturacion';
import { HttpTestingController } from '@angular/common/http/testing';
import { environment } from 'environments/environment';

describe('FacturacionComponent', () => {
  let component: FacturacionComponent;
  let httpMock: HttpTestingController;

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
    httpMock = TestBed.inject(HttpTestingController);
    localStorage.clear();
  });

  afterEach(() => {
    httpMock.verify();
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
  it('cargarFacturas debe cargar y aplicar filtros', () => {
    const mockFacturas: any[] = [
      { idFactura: 1, monto: 100000, estadoPago: 'pendiente', nombreCliente: 'Test',
        nombreTerapeuta: 'T1', fechaReserva: '2026-01-01', horaInicio: '09:00',
        horaFin: '10:00', nombresServicios: ['Masaje'], estadoReserva: 'finalizada',
        idReserva: 1, fechaEmision: '2026-01-01' }
    ];
    component.cargarFacturas();
    const req = httpMock.expectOne(`${environment.apiUrl}/facturas`);
    req.flush(mockFacturas);
    expect(component.facturas.length).toBe(1);
    expect(component.cantidadFacturas).toBe(1);
  });

  it('cargarFacturas debe mostrar toast en error', () => {
    component.cargarFacturas();
    const req = httpMock.expectOne(`${environment.apiUrl}/facturas`);
    req.flush('error', { status: 500, statusText: 'Server Error' });
    expect(component.toasts.length).toBe(1);
  });

  it('cargarReservasSinFactura debe cargar reservas', () => {
    const mockReservas: any[] = [
      { idReserva: 1, nombreCliente: 'Test', nombresServicios: [], idServicios: [] }
    ];
    component.cargarReservasSinFactura();
    const req = httpMock.expectOne(`${environment.apiUrl}/reservas/finalizadas-sin-factura`);
    req.flush(mockReservas);
    expect(component.reservasSinFactura.length).toBe(1);
  });

  it('cargarServicios debe cargar solo servicios activos', () => {
    const mockServicios: any[] = [
      { idServicio: 1, nombre: 'Masaje', estado: 'activo', precio: 50000, duracionMinutos: 60, descripcion: '' },
      { idServicio: 2, nombre: 'Facial', estado: 'inactivo', precio: 40000, duracionMinutos: 45, descripcion: '' }
    ];
    component.cargarServicios();
    const req = httpMock.expectOne(`${environment.apiUrl}/servicios`);
    req.flush(mockServicios);
    expect(component.todosServicios.length).toBe(1);
    expect(component.todosServicios[0].nombre).toBe('Masaje');
  });

  it('generarFactura debe hacer POST y cerrar modal', () => {
    component.reservaSeleccionada = { idReserva: 1 } as any;
    component.showGenerarModal = true;
    component.generarFactura();
    const req = httpMock.expectOne(`${environment.apiUrl}/facturas/reserva/1`);
    req.flush({});
    // cargarTodo hace 3 llamadas
    httpMock.expectOne(`${environment.apiUrl}/facturas`).flush([]);
    httpMock.expectOne(`${environment.apiUrl}/reservas/finalizadas-sin-factura`).flush([]);
    httpMock.expectOne(`${environment.apiUrl}/servicios`).flush([]);
    expect(component.showGenerarModal).toBe(false);
  });

  it('generarFactura no debe ejecutar si isSubmitting es true', () => {
    component.reservaSeleccionada = { idReserva: 1 } as any;
    component.isSubmitting = true;
    component.generarFactura();
    httpMock.expectNone(`${environment.apiUrl}/facturas/reserva/1`);
  });

  it('generarFactura debe mostrar toast en error', () => {
    component.reservaSeleccionada = { idReserva: 1 } as any;
    component.generarFactura();
    const req = httpMock.expectOne(`${environment.apiUrl}/facturas/reserva/1`);
    req.flush({ message: 'Error' }, { status: 400, statusText: 'Bad Request' });
    expect(component.toasts.length).toBe(1);
    expect(component.isSubmitting).toBe(false);
  });

  it('registrarPago debe hacer PATCH y mostrar toast', () => {
    const factura: any = { idFactura: 1, estadoPago: 'pendiente' };
    component.registrarPago(factura);
    const req = httpMock.expectOne(`${environment.apiUrl}/facturas/1/pagar`);
    req.flush({});
    httpMock.expectOne(`${environment.apiUrl}/facturas`).flush([]);
    expect(component.toasts.length).toBe(1);
  });

  it('registrarPago debe actualizar facturaDetalle si coincide', () => {
    const factura: any = { idFactura: 1, estadoPago: 'pendiente' };
    component.facturaDetalle = { idFactura: 1, estadoPago: 'pendiente' } as any;
    component.registrarPago(factura);
    const req = httpMock.expectOne(`${environment.apiUrl}/facturas/1/pagar`);
    req.flush({});
    httpMock.expectOne(`${environment.apiUrl}/facturas`).flush([]);
    expect(component.facturaDetalle?.estadoPago).toBe('pagado');
  });

  it('registrarPago debe mostrar toast en error', () => {
    const factura: any = { idFactura: 1 };
    component.registrarPago(factura);
    const req = httpMock.expectOne(`${environment.apiUrl}/facturas/1/pagar`);
    req.flush('error', { status: 500, statusText: 'Server Error' });
    expect(component.toasts.length).toBe(1);
  });

  it('guardarServicios debe hacer PATCH y cerrar modal', () => {
    component.reservaEditando = { idReserva: 1 } as any;
    component.serviciosSeleccionados = [1, 2];
    component.guardarServicios();
    const req = httpMock.expectOne(`${environment.apiUrl}/reservas/1/servicios`);
    req.flush({});
    httpMock.expectOne(`${environment.apiUrl}/facturas`).flush([]);
    httpMock.expectOne(`${environment.apiUrl}/reservas/finalizadas-sin-factura`).flush([]);
    httpMock.expectOne(`${environment.apiUrl}/servicios`).flush([]);
    expect(component.showEditServiciosModal).toBe(false);
  });

  it('guardarServicios no ejecuta si serviciosSeleccionados esta vacio', () => {
    component.reservaEditando = { idReserva: 1 } as any;
    component.serviciosSeleccionados = [];
    component.guardarServicios();
    httpMock.expectNone(`${environment.apiUrl}/reservas/1/servicios`);
  });

  it('guardarServicios debe mostrar toast en error', () => {
    component.reservaEditando = { idReserva: 1 } as any;
    component.serviciosSeleccionados = [1];
    component.guardarServicios();
    const req = httpMock.expectOne(`${environment.apiUrl}/reservas/1/servicios`);
    req.flush('error', { status: 500, statusText: 'Server Error' });
    expect(component.toasts.length).toBe(1);
    expect(component.isSubmittingServicios).toBe(false);
  });

  it('getEstadoClass debe retornar clase correcta para anulada', () => {
    expect(component.getEstadoClass('anulada')).toBe('estado--anulada');
  });

  it('getEstadoIcon debe retornar icono correcto para anulada', () => {
    expect(component.getEstadoIcon('anulada')).toBe('cancel');
  });

  it('getEstadoIcon debe retornar info para estado desconocido', () => {
    expect(component.getEstadoIcon('desconocido')).toBe('info');
  });
});