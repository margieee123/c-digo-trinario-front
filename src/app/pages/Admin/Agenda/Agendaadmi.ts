// pages/admin/Agenda/Agendaadmi.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';

@Component({
  selector: 'app-agendaadmi',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './Agendaadmi.html',
  styleUrls: ['./Agendaadmi.css']
})
export class Agendaadmi implements OnInit {

  nombre: string = '';
  semanaLabel: string = '15 - 21 Mayo, 2024';

  pulse = {
    citasHoy:    24,
    ingresos:    '€2.8k',
    sinAsignar:  '03'
  };

  terapeutas = [
    {
      nombre: 'Elena Vega',
      rol: 'Fisioterapeuta',
      citas: [
        { tipo: 'cita',  hora: '09:00 - 10:30', servicio: 'Masaje Tejido Profundo', cliente: 'Isabel Aranda',  color: 'gold' },
        { tipo: 'libre', label: 'Libre' },
        { tipo: 'cita',  hora: '12:00 - 13:00', servicio: 'Drenaje Linfático',      cliente: 'Carmen Soler',  color: 'dim'  }
      ]
    },
    {
      nombre: 'Marco Ruiz',
      rol: 'Osteópata',
      citas: [
        { tipo: 'libre', label: 'Descanso' },
        { tipo: 'cita',  hora: '11:30 - 13:00', servicio: 'Osteopatía Sacra', cliente: 'Javier Gómez', color: 'gold' }
      ]
    },
    {
      nombre: 'Sofía Luna',
      rol: 'Esteticista',
      citas: [
        { tipo: 'cita', hora: '10:00 - 11:30', servicio: 'Facial de Oro 24K', cliente: 'Beatriz Ortiz', color: 'gold' },
        { tipo: 'cita', hora: '11:30 - 12:30', servicio: 'Peeling Químico',   cliente: 'Lucía Ferrán',  color: 'gold' }
      ]
    },
    {
      nombre: 'David Pons',
      rol: 'Masajista',
      citas: [
        { tipo: 'cita', hora: '09:30 - 11:00', servicio: 'Masaje Deportivo', cliente: 'Andrés Silva', color: 'dim' }
      ]
    },
    {
      nombre: 'Ana Belén',
      rol: 'Rituales',
      citas: [
        { tipo: 'cita', hora: '10:00 - 12:30', servicio: 'Ritual Hammam', cliente: 'Patricia M.', color: 'gold' }
      ]
    }
  ];

  distribucion = [
    { label: 'Tratamientos Faciales', pct: 45 },
    { label: 'Masajes Corporales',    pct: 35 }
  ];

  constructor(private readonly router: Router) {}

  ngOnInit(): void {
    this.nombre = localStorage.getItem('nombre') || 'Administrador';
  }

  cerrarSesion(): void {
    localStorage.clear();
    this.router.navigate(['/login']);
  }
}