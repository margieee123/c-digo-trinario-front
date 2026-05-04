import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet, RouterModule } from '@angular/router'; // ← agrega RouterModule

@Component({
  selector: 'app-inicioadmi',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterModule], // ← agrega RouterModule aquí
  templateUrl: './inicioadmi.html',
  styleUrls: ['./inicioadmi.css']
})
export class InicioAdmi implements OnInit {

  constructor(private readonly router: Router) {}

  irNuevaReserva() {
    this.router.navigate(['/nueva-reserva']); // ← ya coincide con tu ruta
  }
  nombre: string = '';


  ngOnInit() {
    this.nombre = localStorage.getItem('nombre') || 'Administrador';
  }

  cerrarSesion() {
    localStorage.clear();
    this.router.navigate(['/login']);
  }

  kpiCards = [
    {
      label: 'INGRESOS TOTALES',
      value: '$142,850',
      sub: '+12.5% desde el mes pasado',
      icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>`
    },
    {
      label: 'RESERVAS',
      value: '1,248',
      sub: '+8% crecimiento temporada alta',
      icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`
    },
    {
      label: 'RETENCIÓN',
      value: '94.2%',
      sub: 'Excelente fidelidad de clientes',
      icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`
    },
    {
      label: 'SERVICIO TOP',
      value: 'Satin Wrap',
      sub: '420 sesiones este mes',
      icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`
    }
  ];

  barData = [
    { height: 45, highlight: false },
    { height: 60, highlight: false },
    { height: 55, highlight: false },
    { height: 70, highlight: false },
    { height: 50, highlight: false },
    { height: 85, highlight: true  },
    { height: 65, highlight: false }
  ];

  profesionales = [
    {
      nombre: 'Marcus Chen',
      rol: 'Terapeuta Senior',
      especialidad: 'Zen Aromatherapy',
      estado: 'activo',
      estadoLabel: 'ACTIVO',
      avatar: 'https://i.pravatar.cc/40?img=12'
    },
    {
      nombre: 'Elena Rodriguez',
      rol: 'Maestra Esteticista',
      especialidad: 'Hydro-Radiance',
      estado: 'activo',
      estadoLabel: 'ACTIVA',
      avatar: 'https://i.pravatar.cc/40?img=25'
    },
    {
      nombre: 'Jameson Wells',
      rol: 'Director de Clínica',
      especialidad: 'Admin / Wellness',
      estado: 'permiso',
      estadoLabel: 'EN PERMISO',
      avatar: 'https://i.pravatar.cc/40?img=33'
    }
  ];

  servicios = [
    { nombre: 'Masaje con Piedras Obsidianas', descripcion: 'Terapia térmica de tejido profundo', precio: '$180', tiempo: '90MIN' },
    { nombre: 'Facial de Polvo de Oro',         descripcion: 'Rejuvenecimiento de lujo 24k',       precio: '$240', tiempo: '60MIN' },
    { nombre: 'Exfoliación con Sal del Himalaya',descripcion: 'Detox mineral exfoliante',           precio: '$155', tiempo: '45MIN' },
    { nombre: 'Envoltura Satinada',              descripcion: 'Infusión de seda corporal',          precio: '$210', tiempo: '75MIN' }
  ];
}