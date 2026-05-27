import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { Serviciosadmi } from './Serviciosadmi';
import { environment } from 'environments/environment';

describe('Serviciosadmi', () => {
  let component: Serviciosadmi;
  let httpMock: HttpTestingController;
  const apiUrl = environment.apiUrl + '/servicios';

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Serviciosadmi],
      providers: [
        provideRouter([{ path: '**', redirectTo: '' }]),
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    }).compileComponents();

    const fixture = TestBed.createComponent(Serviciosadmi);
    component = fixture.componentInstance;
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

  it('debe iniciar con form vacio', () => {
    expect(component.form.nombre).toBe('');
    expect(component.form.precio).toBeNull();
    expect(component.form.duracionMinutos).toBeNull();
  });

  it('debe iniciar con currentPage en 0', () => {
    expect(component.currentPage).toBe(0);
  });

  it('cargarServicios debe cargar servicios', () => {
    const mockServicios = [
      { idServicio: 1, nombre: 'Masaje', descripcion: '', precio: 100, duracionMinutos: 60, estado: 'activo' }
    ];
    component.cargarServicios();
    httpMock.expectOne(apiUrl).flush(mockServicios);
    expect(component.services.length).toBe(1);
  });

  it('cargarServicios debe mostrar toast en error', () => {
    component.cargarServicios();
    httpMock.expectOne(apiUrl).flush('error', { status: 500, statusText: 'Server Error' });
    expect(component.toasts.length).toBe(1);
  });

  it('serviciosFiltrados debe filtrar por activos por defecto', () => {
    component.services = [
      { idServicio: 1, nombre: 'Masaje', descripcion: '', precio: 100, duracionMinutos: 60, estado: 'activo' },
      { idServicio: 2, nombre: 'Facial', descripcion: '', precio: 80, duracionMinutos: 45, estado: 'inactivo' }
    ];
    expect(component.serviciosFiltrados.length).toBe(1);
  });

  it('serviciosFiltrados debe filtrar por inactivos cuando mostrarInactivos es true', () => {
    component.services = [
      { idServicio: 1, nombre: 'Masaje', descripcion: '', precio: 100, duracionMinutos: 60, estado: 'activo' },
      { idServicio: 2, nombre: 'Facial', descripcion: '', precio: 80, duracionMinutos: 45, estado: 'inactivo' }
    ];
    component.mostrarInactivos = true;
    expect(component.serviciosFiltrados.length).toBe(1);
    expect(component.serviciosFiltrados[0].nombre).toBe('Facial');
  });

  it('serviciosFiltrados debe filtrar por busqueda', () => {
    component.services = [
      { idServicio: 1, nombre: 'Masaje Relajante', descripcion: '', precio: 100, duracionMinutos: 60, estado: 'activo' },
      { idServicio: 2, nombre: 'Facial', descripcion: '', precio: 80, duracionMinutos: 45, estado: 'activo' }
    ];
    component.busqueda = 'masaje';
    expect(component.serviciosFiltrados.length).toBe(1);
  });

  it('totalPages debe ser minimo 1', () => {
    component.services = [];
    expect(component.totalPages).toBe(1);
  });

  it('totalPages debe calcular paginas correctamente', () => {
    component.services = Array.from({ length: 12 }, (_, i) => ({
      idServicio: i + 1, nombre: `Servicio ${i}`, descripcion: '',
      precio: 100, duracionMinutos: 60, estado: 'activo'
    }));
    expect(component.totalPages).toBe(2);
  });

  it('prevPage no debe ir por debajo de 0', () => {
    component.currentPage = 0;
    component.prevPage();
    expect(component.currentPage).toBe(0);
  });

  it('nextPage no debe sobrepasar totalPages', () => {
    component.services = [
      { idServicio: 1, nombre: 'Masaje', descripcion: '', precio: 100, duracionMinutos: 60, estado: 'activo' }
    ];
    component.currentPage = 0;
    component.nextPage();
    expect(component.currentPage).toBe(0);
  });

  it('nextPage debe avanzar si hay mas paginas', () => {
    component.services = Array.from({ length: 12 }, (_, i) => ({
      idServicio: i + 1, nombre: `Servicio ${i}`, descripcion: '',
      precio: 100, duracionMinutos: 60, estado: 'activo'
    }));
    component.currentPage = 0;
    component.nextPage();
    expect(component.currentPage).toBe(1);
  });

  it('goToPage debe cambiar la pagina actual', () => {
    component.goToPage(2);
    expect(component.currentPage).toBe(2);
  });

  it('openAddModal debe resetear el form y abrir modal', () => {
    component.openAddModal();
    expect(component.showServiceModal).toBe(true);
    expect(component.isEditing).toBe(false);
    expect(component.form.nombre).toBe('');
  });

  it('openEditModal debe cargar datos del servicio', () => {
    const svc = { idServicio: 1, nombre: 'Masaje', descripcion: 'Desc', precio: 100, duracionMinutos: 60, estado: 'activo' };
    component.openEditModal(svc);
    expect(component.showServiceModal).toBe(true);
    expect(component.isEditing).toBe(true);
    expect(component.form.nombre).toBe('Masaje');
    expect(component.form.precio).toBe(100);
  });

  it('closeServiceModal debe cerrar modal', () => {
    component.showServiceModal = true;
    component.closeServiceModal();
    expect(component.showServiceModal).toBe(false);
  });

  it('submitForm debe mostrar error si campos requeridos estan vacios', () => {
    component.form = { nombre: '', descripcion: '', precio: null, duracionMinutos: null, imagenUrl: '' };
    component.submitForm();
    expect(component.toasts.length).toBeGreaterThan(0);
    expect(component.toasts[0].type).toBe('error');
  });

  it('submitForm no ejecuta si isSubmitting es true', () => {
    component.isSubmitting = true;
    component.submitForm();
    httpMock.expectNone(apiUrl);
  });

  it('submitForm debe crear servicio con POST', () => {
    component.form = { nombre: 'Nuevo', descripcion: 'Desc', precio: 100, duracionMinutos: 60, imagenUrl: '' };
    component.isEditing = false;
    component.submitForm();
    const req = httpMock.expectOne(apiUrl);
    expect(req.request.method).toBe('POST');
    req.flush({});
    httpMock.expectOne(apiUrl).flush([]);
    expect(component.toasts[0].type).toBe('success');
  });

  it('submitForm POST debe mostrar toast en error', () => {
    component.form = { nombre: 'Nuevo', descripcion: 'Desc', precio: 100, duracionMinutos: 60, imagenUrl: '' };
    component.isEditing = false;
    component.submitForm();
    httpMock.expectOne(apiUrl).flush('error', { status: 500, statusText: 'Server Error' });
    expect(component.toasts[0].type).toBe('error');
    expect(component.isSubmitting).toBe(false);
  });

  it('submitForm debe actualizar servicio con PUT', () => {
    component.form = { nombre: 'Actualizado', descripcion: 'Desc', precio: 150, duracionMinutos: 90, imagenUrl: '' };
    component.isEditing = true;
    component.editingId = 1;
    component.submitForm();
    const req = httpMock.expectOne(`${apiUrl}/1`);
    expect(req.request.method).toBe('PUT');
    req.flush({});
    httpMock.expectOne(apiUrl).flush([]);
    expect(component.toasts[0].type).toBe('success');
  });

  it('submitForm PUT debe mostrar toast en error', () => {
    component.form = { nombre: 'Actualizado', descripcion: 'Desc', precio: 150, duracionMinutos: 90, imagenUrl: '' };
    component.isEditing = true;
    component.editingId = 1;
    component.submitForm();
    httpMock.expectOne(`${apiUrl}/1`).flush('error', { status: 500, statusText: 'Server Error' });
    expect(component.toasts[0].type).toBe('error');
    expect(component.isSubmitting).toBe(false);
  });

  it('accionEstado debe abrir modal para servicio activo', () => {
    const svc = { idServicio: 1, nombre: 'Masaje', descripcion: '', precio: 100, duracionMinutos: 60, estado: 'activo' };
    component.accionEstado(svc);
    expect(component.showConfirmModal).toBe(true);
    expect(component.deletingId).toBe(1);
  });

  it('accionEstado debe activar directo si servicio es inactivo', () => {
    const svc = { idServicio: 2, nombre: 'Facial', descripcion: '', precio: 80, duracionMinutos: 45, estado: 'inactivo' };
    component.accionEstado(svc);
    const req = httpMock.expectOne(`${apiUrl}/2/estado?estado=activo`);
    req.flush({});
    httpMock.expectOne(apiUrl).flush([]);
    expect(component.toasts[0].type).toBe('success');
  });

  it('activar debe mostrar toast en error', () => {
    component.activar(1);
    httpMock.expectOne(`${apiUrl}/1/estado?estado=activo`).flush('error', { status: 500, statusText: 'Server Error' });
    expect(component.toasts[0].type).toBe('error');
  });

  it('closeConfirmModal debe cerrar modal', () => {
    component.showConfirmModal = true;
    component.closeConfirmModal();
    expect(component.showConfirmModal).toBe(false);
  });

  it('confirmDesactivar debe hacer PATCH y mostrar toast', () => {
    component.deletingId = 1;
    component.deletingName = 'Masaje';
    component.confirmDesactivar();
    const req = httpMock.expectOne(`${apiUrl}/1/estado?estado=inactivo`);
    req.flush({});
    httpMock.expectOne(apiUrl).flush([]);
    expect(component.toasts[0].type).toBe('info');
    expect(component.deletingId).toBeNull();
  });

  it('confirmDesactivar debe mostrar toast en error', () => {
    component.deletingId = 1;
    component.confirmDesactivar();
    httpMock.expectOne(`${apiUrl}/1/estado?estado=inactivo`).flush('error', { status: 500, statusText: 'Server Error' });
    expect(component.toasts[0].type).toBe('error');
  });

  it('confirmDesactivar no ejecuta si deletingId es null', () => {
    component.deletingId = null;
    component.confirmDesactivar();
    httpMock.expectNone(`${apiUrl}/null/estado?estado=inactivo`);
  });

  it('totalCount debe retornar cantidad de servicios filtrados', () => {
    component.services = [
      { idServicio: 1, nombre: 'Masaje', descripcion: '', precio: 100, duracionMinutos: 60, estado: 'activo' }
    ];
    expect(component.totalCount).toBe(1);
  });

  it('showingCount debe retornar cantidad de items en pagina', () => {
    component.services = [
      { idServicio: 1, nombre: 'Masaje', descripcion: '', precio: 100, duracionMinutos: 60, estado: 'activo' }
    ];
    expect(component.showingCount).toBe(1);
  });

  it('pageArray debe retornar array de indices de paginas', () => {
    component.services = Array.from({ length: 12 }, (_, i) => ({
      idServicio: i + 1, nombre: `Servicio ${i}`, descripcion: '',
      precio: 100, duracionMinutos: 60, estado: 'activo'
    }));
    expect(component.pageArray.length).toBe(2);
  });

  it('showToast debe agregar toast a la lista', () => {
    component.showToast('Test message', 'success');
    expect(component.toasts.length).toBe(1);
    expect(component.toasts[0].type).toBe('success');
  });
});