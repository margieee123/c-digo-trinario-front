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

interface Usuario {
  id: number;
  nombre: string;
  correo: string;
  rol: string;
  estado: string;
}

@Component({
  selector: 'app-iniciorecep',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, Navbar],
  templateUrl: './iniciorecep.html',
  styleUrls: ['./iniciorecep.css']
})
export class IniciorecepComponent implements OnInit {

  private apiUrl = environment.apiUrl;

  nombre: string = '';
  fechaHoy: string = '';
  horaActual: string = '';
  procesandoReserva: number | null = null;

  // Datos del backend
  reservasHoy: Reserva[] = [];
  terapeutas: Usuario[] = [];
  totalPagadoHoy: number = 0;
  totalPendienteHoy: number = 0;
  citasHoy: number = 0;
  citasPendientes: number = 0;
  citasConfirmadas: number = 0;

  // Búsqueda cliente
  busquedaCliente: string = '';
  clientesEncontrados: Usuario[] = [];
  buscando: boolean = false;

  // Filtro citas
  filtroActivo: string = 'todas';

  constructor(
    private router: Router,
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.nombre = localStorage.getItem('nombre') || 'Recepcionista';
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
    this.cargarTerapeutas();
  }

  cargarReservasHoy(): void {
    const hoy = this.formatFecha(new Date());
    this.http.get<Reserva[]>(
      `${this.apiUrl}/reservas/filtrar?fechaInicio=${hoy}&fechaFin=${hoy}`,
      { headers: this.getHeaders() }
    ).subscribe({
      next: (data) => {
        this.reservasHoy = data.sort((a, b) =>
          a.horaInicio.localeCompare(b.horaInicio)
        );
        this.calcularKpis();
        this.cdr.detectChanges();
      },
      error: () => console.error('Error al cargar reservas')
    });
  }

  cargarTerapeutas(): void {
    this.http.get<Usuario[]>(`${this.apiUrl}/usuarios`, { headers: this.getHeaders() }).subscribe({
      next: (data) => {
        this.terapeutas = data.filter(u => u.rol === 'terapeuta' && u.estado === 'activo');
        this.cdr.detectChanges();
      }
    });
  }

  calcularKpis(): void {
    this.citasHoy = this.reservasHoy.filter(r => r.estado !== 'cancelada').length;
    this.citasPendientes = this.reservasHoy.filter(r => r.estado === 'pendiente').length;
    this.citasConfirmadas = this.reservasHoy.filter(r => r.estado === 'confirmada').length;
    this.totalPendienteHoy = this.reservasHoy
      .filter(r => r.estado !== 'cancelada' && r.estado !== 'finalizada')
      .reduce((sum, r) => sum + (r.totalServicios || 0), 0);
  }

  get reservasFiltradas(): Reserva[] {
    if (this.filtroActivo === 'pendientes') {
      return this.reservasHoy.filter(r => r.estado === 'pendiente');
    }
    if (this.filtroActivo === 'confirmadas') {
      return this.reservasHoy.filter(r => r.estado === 'confirmada');
    }
    return this.reservasHoy;
  }

  cambiarFiltro(filtro: string): void {
    this.filtroActivo = filtro;
  }

  cambiarEstado(reserva: Reserva, nuevoEstado: string): void {
    this.procesandoReserva = reserva.idReserva;
    this.http.patch(
      `${this.apiUrl}/reservas/${reserva.idReserva}/estado?estado=${nuevoEstado}`,
      {},
      { headers: this.getHeaders() }
    ).subscribe({
      next: () => {
        this.procesandoReserva = null;
        this.cargarReservasHoy();
      },
      error: () => {
        this.procesandoReserva = null;
        console.error('Error al cambiar estado');
      }
    });
  }

  buscarCliente(): void {
    if (!this.busquedaCliente.trim() || this.busquedaCliente.length < 2) {
      this.clientesEncontrados = [];
      return;
    }
    this.buscando = true;
    this.http.get<Usuario[]>(
      `${this.apiUrl}/usuarios/buscar?nombre=${this.busquedaCliente}`,
      { headers: this.getHeaders() }
    ).subscribe({
      next: (data) => {
        this.clientesEncontrados = data;
        this.buscando = false;
        this.cdr.detectChanges();
      },
      error: () => { this.buscando = false; }
    });
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

  private formatFecha(d: Date): string {
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  }

  cerrarSesion(): void {
    localStorage.clear();
    this.router.navigate(['/login']);
  }

  irANuevaReserva(): void {
    this.router.navigate(['/dashboard/recepcionista/reservas']);
  }

  irAAgenda(): void {
    this.router.navigate(['/dashboard/recepcionista/agenda']);
  }

  irAFacturacion(): void {
    this.router.navigate(['/dashboard/recepcionista/facturacion']);
  }
}