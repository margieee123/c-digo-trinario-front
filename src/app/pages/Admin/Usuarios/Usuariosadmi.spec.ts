import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { vi } from 'vitest';
import { Usuariosadmi } from './Usuariosadmi';

describe('Usuariosadmi', () => {
  let component: Usuariosadmi;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Usuariosadmi],
      providers: [
        provideRouter([{ path: '**', redirectTo: '' }]),
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    }).compileComponents();

    const fixture = TestBed.createComponent(Usuariosadmi);
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
    localStorage.setItem('nombre', 'Admin Test');
    component.ngOnInit();
    expect(component.nombre).toBe('Admin Test');
  });

  it('debe usar Administrador como nombre por defecto', () => {
    component.ngOnInit();
    expect(component.nombre).toBe('Administrador');
  });

  it('clientesFiltrados debe retornar solo clientes activos por defecto', () => {
    component.clientes = [
      { id: 1, nombre: 'Cliente 1', correo: 'c1@test.com', rol: 'cliente', estado: 'activo' },
      { id: 2, nombre: 'Cliente 2', correo: 'c2@test.com', rol: 'cliente', estado: 'inactivo' }
    ];
    expect(component.clientesFiltrados.length).toBe(1);
    expect(component.clientesFiltrados[0].nombre).toBe('Cliente 1');
  });

  it('clientesFiltrados debe retornar inactivos cuando mostrarInactivos es true', () => {
    component.clientes = [
      { id: 1, nombre: 'Cliente 1', correo: 'c1@test.com', rol: 'cliente', estado: 'activo' },
      { id: 2, nombre: 'Cliente 2', correo: 'c2@test.com', rol: 'cliente', estado: 'inactivo' }
    ];
    component.mostrarInactivos = true;
    expect(component.clientesFiltrados.length).toBe(1);
    expect(component.clientesFiltrados[0].nombre).toBe('Cliente 2');
  });

  it('clientesFiltrados debe filtrar por busqueda', () => {
    component.clientes = [
      { id: 1, nombre: 'Juan Perez', correo: 'juan@test.com', rol: 'cliente', estado: 'activo' },
      { id: 2, nombre: 'Maria Lopez', correo: 'maria@test.com', rol: 'cliente', estado: 'activo' }
    ];
    component.busqueda = 'juan';
    expect(component.clientesFiltrados.length).toBe(1);
    expect(component.clientesFiltrados[0].nombre).toBe('Juan Perez');
  });

  it('especialistasFiltrados debe retornar solo activos por defecto', () => {
    component.especialistas = [
      { id: 3, nombre: 'Terapeuta 1', correo: 't1@test.com', rol: 'terapeuta', estado: 'activo' },
      { id: 4, nombre: 'Terapeuta 2', correo: 't2@test.com', rol: 'terapeuta', estado: 'inactivo' }
    ];
    expect(component.especialistasFiltrados.length).toBe(1);
  });

  it('openAddCliente debe abrir modal con rol cliente', () => {
    component.openAddCliente();
    expect(component.showUserModal).toBe(true);
    expect(component.isEditing).toBe(false);
    expect(component.form.rol).toBe('cliente');
  });

  it('openAddEspecialista debe abrir modal con rol terapeuta', () => {
    component.openAddEspecialista();
    expect(component.showUserModal).toBe(true);
    expect(component.isEditing).toBe(false);
    expect(component.form.rol).toBe('terapeuta');
  });

  it('openEditCliente debe cargar datos del usuario', () => {
    const u = { id: 1, nombre: 'Juan', correo: 'juan@test.com', rol: 'cliente', estado: 'activo' };
    component.openEditCliente(u);
    expect(component.showUserModal).toBe(true);
    expect(component.isEditing).toBe(true);
    expect(component.form.nombre).toBe('Juan');
    expect(component.form.correo).toBe('juan@test.com');
  });

  it('openEditEspecialista debe cargar datos del especialista', () => {
    const u = { id: 2, nombre: 'Maria', correo: 'maria@test.com', rol: 'terapeuta', estado: 'activo' };
    component.openEditEspecialista(u);
    expect(component.showUserModal).toBe(true);
    expect(component.isEditing).toBe(true);
    expect(component.form.nombre).toBe('Maria');
  });

  it('closeUserModal debe cerrar modal', () => {
    component.showUserModal = true;
    component.closeUserModal();
    expect(component.showUserModal).toBe(false);
  });

  it('submitForm debe mostrar error si campos requeridos estan vacios', () => {
    component.form = { nombre: '', correo: '', password: '', rol: '' };
    component.submitForm();
    expect(component.toasts.length).toBeGreaterThan(0);
    expect(component.toasts[0].type).toBe('error');
  });

  it('submitForm debe mostrar error si no hay password al crear', () => {
    component.isEditing = false;
    component.form = { nombre: 'Test', correo: 'test@test.com', password: '', rol: 'cliente' };
    component.submitForm();
    expect(component.toasts.some(t => t.type === 'error')).toBe(true);
  });

  it('showToast debe agregar toast a la lista', () => {
    component.showToast('Test message', 'success');
    expect(component.toasts.length).toBe(1);
    expect(component.toasts[0].message).toBe('Test message');
    expect(component.toasts[0].type).toBe('success');
  });

  it('cerrarSesion debe limpiar localStorage y navegar al login', () => {
    const spy = vi.spyOn(router, 'navigate').mockResolvedValue(true);
    localStorage.setItem('token', 'fake-token');
    component.cerrarSesion();
    expect(localStorage.getItem('token')).toBeNull();
    expect(spy).toHaveBeenCalledWith(['/login']);
  });
});