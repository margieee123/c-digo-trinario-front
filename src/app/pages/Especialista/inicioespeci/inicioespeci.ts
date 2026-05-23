import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Navbar } from '../../../components/navbar/navbar';
import { environment } from 'environments/environment';
interface Reserva {
  idReserva: number;
  idCliente: number;
  nombreCliente: string;
  idServicios: number[];
  nombresServicios: string[];
  idTerapeuta: number;
  nombreTerapeuta: string;
  fecha: string;
  horaInicio: string;
  horaFin: string;
  estado: string;
  totalServicios: number;
}

@Component({
  selector: 'app-inicioespeci',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, Navbar],
  templateUrl: './inicioespeci.html',
  styleUrls: ['./inicioespeci.css']
})
export class IniciospeciComponent implements OnInit {

  private apiUrl = environment.apiUrl;

  nombre: string = '';
  iniciales: string = '';
  fechaHoy: string = '';
  horaActual: string = '';

  // Datos del backend
  reservasHoy: Reserva[] = [];
  reservasSemana: Reserva[] = [];
  citasHoy: number = 0;
  citasSemana: number = 0;
  reservaActual: Reserva | null = null;

  // Vista
  vistaActiva: string = 'diario';

  constructor(
    private router: Router,
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const nombreCompleto = localStorage.getItem('nombre') || 'Terapeuta';
    this.nombre = nombreCompleto;
    this.iniciales = nombreCompleto
      .split(' ')
      .map((n: string) => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();

    this.actualizarFechaHora();
    setInterval(() => this.actualizarFechaHora(), 60000);
    this.cargarDatos();
  }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }

  actualizarFechaHora(): void {
    const hoy = new Date();
    this.fechaHoy = hoy.toLocaleDateString('es-ES', {
      weekday: 'long', day: 'numeric', month: 'long'
    });
    this.horaActual = hoy.toLocaleTimeString('es-ES', {
      hour: '2-digit', minute: '2-digit', hour12: true
    });
    this.cdr.detectChanges();
  }

  cargarDatos(): void {
    this.cargarReservasHoy();
    this.cargarReservasSemana();
  }

  cargarReservasHoy(): void {
    const hoy = this.formatFecha(new Date());
    this.http.get<Reserva[]>(
      `${this.apiUrl}/reservas/mis-reservas`,
      { headers: this.getHeaders() }
    ).subscribe({
      next: (data) => {
        this.reservasHoy = data
          .filter(r => r.fecha === hoy)
          .sort((a, b) => a.horaInicio.localeCompare(b.horaInicio));
        this.citasHoy = this.reservasHoy.filter(r => r.estado !== 'cancelada').length;
        this.reservaActual = this.reservasHoy.find(r => r.estado === 'en_proceso') || null;
        this.cdr.detectChanges();
      },
      error: () => console.error('Error al cargar reservas')
    });
  }

  cargarReservasSemana(): void {
    const hoy = new Date();
    const lunes = this.getLunes(hoy);
    const domingo = new Date(lunes);
    domingo.setDate(lunes.getDate() + 6);

    this.http.get<Reserva[]>(
      `${this.apiUrl}/reservas/mis-reservas`,
      { headers: this.getHeaders() }
    ).subscribe({
      next: (data) => {
        this.reservasSemana = data.filter(r => {
          const fecha = new Date(r.fecha);
          return fecha >= lunes && fecha <= domingo && r.estado !== 'cancelada';
        });
        this.citasSemana = this.reservasSemana.length;
        this.cdr.detectChanges();
      }
    });
  }

  cambiarEstado(reserva: Reserva, nuevoEstado: string): void {
    this.http.patch(
      `${this.apiUrl}/reservas/${reserva.idReserva}/estado?estado=${nuevoEstado}`,
      {},
      { headers: this.getHeaders() }
    ).subscribe({
      next: () => this.cargarReservasHoy(),
      error: () => console.error('Error al cambiar estado')
    });
  }

  getEstadoClass(estado: string): string {
    const classes: Record<string, string> = {
      'pendiente': 'estado--pendiente',
      'confirmada': 'estado--confirmada',
      'en_proceso': 'estado--proceso',
      'finalizada': 'estado--finalizada',
      'cancelada': 'estado--cancelada'
    };
    return classes[estado] || '';
  }

  getEstadoIcon(estado: string): string {
    const icons: Record<string, string> = {
      'pendiente': 'schedule',
      'confirmada': 'check_circle',
      'en_proceso': 'play_circle',
      'finalizada': 'task_alt',
      'cancelada': 'cancel'
    };
    return icons[estado] || 'info';
  }

  private getLunes(fecha: Date): Date {
    const d = new Date(fecha);
    const dia = d.getDay();
    d.setDate(d.getDate() - (dia === 0 ? 6 : dia - 1));
    d.setHours(0, 0, 0, 0);
    return d;
  }

  private formatFecha(d: Date): string {
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  }

  irAAgenda(): void {
    this.router.navigate(['/dashboard/terapeuta/agenda']);
  }

  cerrarSesion(): void {
    localStorage.clear();
    this.router.navigate(['/login']);
  }
}