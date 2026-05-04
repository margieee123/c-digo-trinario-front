import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-iniciorecep',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './iniciorecep.html',
  styleUrls: ['./iniciorecep.css']
})
export class IniciorecepComponent implements OnInit {

  nombre: string = '';
  fechaHoy: string = '';
  horaActual: string = '';

  constructor(private router: Router) {}

  ngOnInit() {
    this.nombre = localStorage.getItem('nombre') || 'Recepcionista';

    const hoy = new Date();
    const opcionesFecha: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      day: 'numeric',
      month: 'long'
    };
    const opcionesHora: Intl.DateTimeFormatOptions = {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    };
    this.fechaHoy = hoy.toLocaleDateString('es-ES', opcionesFecha);
    this.horaActual = hoy.toLocaleTimeString('es-ES', opcionesHora);
  }

  cerrarSesion() {
    localStorage.clear();
    this.router.navigate(['/login']);
  }

  citasHoy = [
    { hora: '09:00', cliente: 'Sofía Martínez',  detalle: 'Masaje Sueco · Elena V. · Sala 2',      estado: 'done',      estadoLabel: 'Check-in',  icono: 'check_circle' },
    { hora: '10:30', cliente: 'Valentina Ríos',  detalle: 'Facial Luminosidad · Ana K. · Sala 1',  estado: 'current',   estadoLabel: '',          icono: '' },
    { hora: '12:00', cliente: 'Laura Gómez',     detalle: 'Aromaterapia · Elena V. · Sala 2',       estado: 'pending',   estadoLabel: 'Esperando', icono: 'schedule' },
    { hora: '02:00', cliente: 'Julianna Torres', detalle: 'Tejido Profundo · Elena V. · Sala 2',    estado: 'pending',   estadoLabel: 'Esperando', icono: 'schedule' },
    { hora: '04:00', cliente: 'Camila Herrera',  detalle: 'Masaje Volcánico · Ana K.',              estado: 'cancelled', estadoLabel: 'Cancelado', icono: 'cancel' },
  ];

  salas = [
    { nombre: 'Sala 1', detalle: 'Masaje Sueco · hasta 10:00', libre: false },
    { nombre: 'Sala 2', detalle: 'Disponible',                  libre: true  },
    { nombre: 'Sala 3', detalle: 'Aromaterapia · hasta 11:15', libre: false },
    { nombre: 'Sala 4', detalle: 'Disponible',                  libre: true  },
  ];

  caja = {
    total:     '$485.00',
    efectivo:  '$185.00',
    tarjeta:   '$300.00',
    pendiente: '$145.00',
  };

  busquedaCliente = '';

  hacerCheckin(hora: string): void {
    console.log('Check-in para cita de las', hora);
  }
}