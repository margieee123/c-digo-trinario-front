import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-inicioespeci',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './inicioespeci.html',
  styleUrls: ['./inicioespeci.css']
})
export class IniciospeciComponent implements OnInit {

  nombre:   string = '';
  iniciales: string = '';
  fechaHoy: string = '';

  constructor(private readonly router: Router) {}

  ngOnInit() {
    const nombreCompleto = localStorage.getItem('nombre') || 'Especialista';
    this.nombre = nombreCompleto;
    this.iniciales = nombreCompleto
      .split(' ')
      .map(n => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();

    const hoy = new Date();
    const opciones: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      day: 'numeric',
      month: 'long'
    };
    this.fechaHoy = hoy.toLocaleDateString('es-ES', opciones);
  }

  cerrarSesion() {
    localStorage.clear();
    this.router.navigate(['/login']);
  }

  // Stats — 3 tarjetas como en el mockup
  stats = [
    { icono: 'event_available', label: 'Citas de Hoy',       valor: '08'  },
    { icono: 'schedule',        label: 'Horas Semanales',     valor: '34.5' },
    { icono: 'reviews',        label: 'Calificación Media',  valor: '4.9' },
  ];

  // Agenda del día
  agenda = [
    {
      hora: '09:00', duracion: '60 MIN',
      servicio: 'Terapia de Tejido Profundo',
      cliente: 'Isabella Martinez', notas: 'Suite 04',
      actual: true,  descanso: false
    },
    {
      hora: '10:30', duracion: '45 MIN',
      servicio: 'Hydrafacial Luxe',
      cliente: 'Marcus Thorne', notas: 'Suite 12',
      actual: false, descanso: false
    },
    {
      hora: '08:00', duracion: '30 MIN',
      servicio: 'Aromaterapia Express',
      cliente: 'Julianna Rossi', notas: 'Suite 01',
      actual: false, descanso: false, finalizado: true
    },
    {
      hora: '12:00', duracion: '90 MIN',
      servicio: 'Masaje Signature Stone',
      cliente: 'Sarah Jenkins', notas: 'Suite 08',
      actual: false, descanso: false, finalizado: false
    },
  ];

  // Próxima cita / sesión actual
  proximaCita = {
    servicio: 'Terapia de Tejido Profundo',
    cliente:  'Isabella Martinez',
    en:       '24 / 60 min',
    nota:     'Prefiere aceites con aroma a lavanda y temperatura ambiente fresca (20°C).',
  };

  // Notas pre-sesión
  resenas = [
    { texto: 'Enfocarse en la región lumbar; evitar el hombro izquierdo por lesión reciente.' },
    { texto: 'Ha expresado interés en la nueva mejora de Piedras de Sal del Himalaya.' },
  ];

  // Estado de salas — reemplaza disponibilidad semanal
  disponibilidad = [
    { dia: 'Suite 04', slots: 'Ocupada',  clase: 'active'  },
    { dia: 'Suite 08', slots: 'Lista',    clase: 'free'    },
    { dia: 'Suite 12', slots: 'Lista',    clase: 'free'    },
    { dia: 'Suite 01', slots: 'Limpieza', clase: 'partial' },
  ];
}