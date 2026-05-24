import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { Serviciosadmi } from './Serviciosadmi';

describe('Serviciosadmi', () => {
  let component: Serviciosadmi;

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
    localStorage.clear();
  });

  afterEach(() => {
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

  it('serviciosFiltrados debe filtrar por activos por defecto', () => {
    component.services = [
      { idServicio: 1, nombre: 'Masaje', descripcion: '', precio: 100, duracionMinutos: 60, estado: 'activo' },
      { idServicio: 2, nombre: 'Facial', descripcion: '', precio: 80, duracionMinutos: 45, estado: 'inactivo' }
    ];
    expect(component.serviciosFiltrados.length).toBe(1);
    expect(component.serviciosFiltrados[0].nombre).toBe('Masaje');
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
      { idServicio: 2, nombre: 'Facial Hidratante', descripcion: '', precio: 80, duracionMinutos: 45, estado: 'activo' }
    ];
    component.busqueda = 'masaje';
    expect(component.serviciosFiltrados.length).toBe(1);
    expect(component.serviciosFiltrados[0].nombre).toBe('Masaje Relajante');
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

  it('accionEstado debe abrir modal de confirmacion para servicio activo', () => {
    const svc = { idServicio: 1, nombre: 'Masaje', descripcion: '', precio: 100, duracionMinutos: 60, estado: 'activo' };
    component.accionEstado(svc);
    expect(component.showConfirmModal).toBe(true);
    expect(component.deletingId).toBe(1);
  });

  it('closeConfirmModal debe cerrar modal de confirmacion', () => {
    component.showConfirmModal = true;
    component.closeConfirmModal();
    expect(component.showConfirmModal).toBe(false);
  });

  it('showToast debe agregar toast a la lista', () => {
    component.showToast('Test message', 'success');
    expect(component.toasts.length).toBe(1);
    expect(component.toasts[0].message).toBe('Test message');
    expect(component.toasts[0].type).toBe('success');
  });
});
