import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { vi } from 'vitest';
import { Component } from '@angular/core';
import { IniciospeciComponent } from './inicioespeci';

// Sobrescribir estilos problemáticos
(IniciospeciComponent as any).ɵcmp.styles = [];

describe('IniciospeciComponent', () => {
  let component: IniciospeciComponent;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IniciospeciComponent],
      providers: [
        provideRouter([{ path: '**', redirectTo: '' }]),
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    }).compileComponents();

    const fixture = TestBed.createComponent(IniciospeciComponent);
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
    localStorage.setItem('nombre', 'Maria Lopez');
    localStorage.setItem('token', 'fake-token');
    component.ngOnInit();
    expect(component.nombre).toBe('Maria Lopez');
  });

  it('debe usar Terapeuta como nombre por defecto', () => {
    component.ngOnInit();
    expect(component.nombre).toBe('Terapeuta');
  });

  it('debe generar iniciales correctamente', () => {
    localStorage.setItem('nombre', 'Maria Lopez');
    component.ngOnInit();
    expect(component.iniciales).toBe('ML');
  });

  it('debe generar iniciales con un solo nombre', () => {
    localStorage.setItem('nombre', 'Maria');
    component.ngOnInit();
    expect(component.iniciales).toBe('M');
  });

  it('debe generar iniciales maximas de 2 caracteres', () => {
    localStorage.setItem('nombre', 'Maria Lopez Garcia');
    component.ngOnInit();
    expect(component.iniciales.length).toBeLessThanOrEqual(2);
  });

  it('getEstadoClass debe retornar clase correcta para pendiente', () => {
    expect(component.getEstadoClass('pendiente')).toBe('estado--pendiente');
  });

  it('getEstadoClass debe retornar clase correcta para confirmada', () => {
    expect(component.getEstadoClass('confirmada')).toBe('estado--confirmada');
  });

  it('getEstadoClass debe retornar clase correcta para en_proceso', () => {
    expect(component.getEstadoClass('en_proceso')).toBe('estado--proceso');
  });

  it('getEstadoClass debe retornar string vacio para estado desconocido', () => {
    expect(component.getEstadoClass('desconocido')).toBe('');
  });

  it('getEstadoIcon debe retornar icono correcto para pendiente', () => {
    expect(component.getEstadoIcon('pendiente')).toBe('schedule');
  });

  it('getEstadoIcon debe retornar icono correcto para en_proceso', () => {
    expect(component.getEstadoIcon('en_proceso')).toBe('play_circle');
  });

  it('getEstadoIcon debe retornar info para estado desconocido', () => {
    expect(component.getEstadoIcon('desconocido')).toBe('info');
  });

  it('debe iniciar con vistaActiva en diario', () => {
    expect(component.vistaActiva).toBe('diario');
  });

  it('debe iniciar citasHoy y citasSemana en 0', () => {
    expect(component.citasHoy).toBe(0);
    expect(component.citasSemana).toBe(0);
  });

  it('debe iniciar reservaActual en null', () => {
    expect(component.reservaActual).toBeNull();
  });

  it('irAAgenda debe navegar a terapeuta agenda', () => {
    const spy = vi.spyOn(router, 'navigate').mockResolvedValue(true);
    component.irAAgenda();
    expect(spy).toHaveBeenCalledWith(['/dashboard/terapeuta/agenda']);
  });

  it('cerrarSesion debe limpiar localStorage y navegar al login', () => {
    const spy = vi.spyOn(router, 'navigate').mockResolvedValue(true);
    localStorage.setItem('token', 'fake-token');
    component.cerrarSesion();
    expect(localStorage.getItem('token')).toBeNull();
    expect(spy).toHaveBeenCalledWith(['/login']);
  });
});