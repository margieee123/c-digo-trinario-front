import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
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

interface Servicio {
  idServicio: number;
  nombre: string;
  descripcion: string;
  precio: number;
  duracionMinutos: number;
  estado: string;
  imagenUrl?: string;
}

interface LogResponse {
  idLog: number;
  tipo: string;
  idUsuario: number;
  nombreUsuario: string;
  descripcion: string;
  ip: string;
  fechaHora: string;
}

interface KpiCard {
  label: string;
  value: string;
  sub: string;
  icon: string;
}

interface BarData {
  height: number;
  highlight: boolean;
  label: string;
  count: number;
}

interface Profesional {
  nombre: string;
  rol: string;
  especialidad: string;
  estado: string;
  estadoLabel: string;
  citasHoy: number;
  avatar: string;
}

@Component({
  selector: 'app-inicioadmi',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, Navbar],
  templateUrl: './inicioadmi.html',
  styleUrls: ['./inicioadmi.css']
})
export class InicioAdmi implements OnInit {

  private apiUrl = environment.apiUrl;
  nombre: string = '';

  // KPIs
  kpiCards: KpiCard[] = [
    {
      label: 'INGRESOS HOY',
      value: '$0',
      sub: 'Cargando...',
      icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>`
    },
    {
      label: 'RESERVAS HOY',
      value: '0',
      sub: 'Cargando...',
      icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`
    },
    {
      label: 'CLIENTES ACTIVOS',
      value: '0',
      sub: 'Cargando...',
      icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`
    },
    {
      label: 'TERAPEUTAS ACTIVOS',
      value: '0',
      sub: 'Cargando...',
      icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`
    }
  ];

  barData: BarData[] = [];
  profesionales: Profesional[] = [];
  servicios: Servicio[] = [];
  logsRecientes: LogResponse[] = [];

  // Estado reservas para dona
  estadosReservas = [
    { label: 'Pendiente', count: 0, color: '#e3c190' },
    { label: 'Confirmada', count: 0, color: '#7eb8f7' },
    { label: 'En proceso', count: 0, color: '#a8e6a3' },
    { label: 'Finalizada', count: 0, color: '#4caf50' },
    { label: 'Cancelada',  count: 0, color: '#666' }
  ];

  totalReservasMes = 0;
  ingresosMes = 0;

  constructor(
    private router: Router,
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.nombre = localStorage.getItem('nombre') || 'Administrador';
    this.cargarDatos();
  }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }

  private formatFecha(d: Date): string {
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  }

  cargarDatos(): void {
    const hoy = this.formatFecha(new Date());
    const inicioMes = this.formatFecha(new Date(new Date().getFullYear(), new Date().getMonth(), 1));
    const finMes = this.formatFecha(new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0));

    // Cargar reservas del mes
    this.http.get<Reserva[]>(
      `${this.apiUrl}/reservas/filtrar?fechaInicio=${inicioMes}&fechaFin=${finMes}`,
      { headers: this.getHeaders() }
    ).subscribe({
      next: (reservas) => {
        const reservasHoy = reservas.filter(r => r.fecha === hoy && r.estado !== 'cancelada');
        const ingresosHoy = reservasHoy.reduce((sum, r) => sum + (r.totalServicios || 0), 0);
        this.ingresosMes = reservas
          .filter(r => r.estado !== 'cancelada')
          .reduce((sum, r) => sum + (r.totalServicios || 0), 0);
        this.totalReservasMes = reservas.filter(r => r.estado !== 'cancelada').length;

        // KPIs
        this.kpiCards[0].value = '$' + ingresosHoy.toLocaleString();
        this.kpiCards[0].sub = `$${this.ingresosMes.toLocaleString()} este mes`;
        this.kpiCards[1].value = String(reservasHoy.length);
        this.kpiCards[1].sub = `${this.totalReservasMes} reservas este mes`;

        // Estados para dona
        this.estadosReservas[0].count = reservas.filter(r => r.estado === 'pendiente').length;
        this.estadosReservas[1].count = reservas.filter(r => r.estado === 'confirmada').length;
        this.estadosReservas[2].count = reservas.filter(r => r.estado === 'en_proceso').length;
        this.estadosReservas[3].count = reservas.filter(r => r.estado === 'finalizada').length;
        this.estadosReservas[4].count = reservas.filter(r => r.estado === 'cancelada').length;

        // Barras por día de la semana actual
        this.generarBarras(reservas);

        this.cdr.detectChanges();
      }
    });

    // Cargar usuarios
    this.http.get<Usuario[]>(`${this.apiUrl}/usuarios`, { headers: this.getHeaders() }).subscribe({
      next: (usuarios) => {
        const clientes = usuarios.filter(u => u.rol === 'cliente' && u.estado === 'activo');
        const terapeutas = usuarios.filter(u => u.rol === 'terapeuta' && u.estado === 'activo');

        this.kpiCards[2].value = String(clientes.length);
        this.kpiCards[2].sub = `${usuarios.filter(u => u.rol === 'cliente').length} clientes registrados`;
        this.kpiCards[3].value = String(terapeutas.length);
        this.kpiCards[3].sub = `${terapeutas.length} disponibles hoy`;

        // Profesionales con citas hoy
        this.http.get<Reserva[]>(
          `${this.apiUrl}/reservas/filtrar?fechaInicio=${hoy}&fechaFin=${hoy}`,
          { headers: this.getHeaders() }
        ).subscribe({
          next: (reservasHoy) => {
            this.profesionales = terapeutas.map(t => ({
              nombre: t.nombre,
              rol: 'Terapeuta',
              especialidad: 'Spa & Wellness',
              estado: t.estado,
              estadoLabel: t.estado === 'activo' ? 'ACTIVO' : 'INACTIVO',
              citasHoy: reservasHoy.filter(r => r.idTerapeuta === t.id && r.estado !== 'cancelada').length,
              avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(t.nombre)}&background=2a2a2a&color=e3c190&size=40`
            }));
            this.cdr.detectChanges();
          }
        });
      }
    });

    // Cargar servicios
    this.http.get<Servicio[]>(`${this.apiUrl}/servicios`, { headers: this.getHeaders() }).subscribe({
      next: (servicios) => {
        this.servicios = servicios.filter(s => s.estado === 'activo').slice(0, 5);
        this.cdr.detectChanges();
      }
    });

    // Cargar logs
    this.http.get<LogResponse[]>(`${this.apiUrl}/logs?limit=8`, { headers: this.getHeaders() }).subscribe({
      next: (logs) => {
        this.logsRecientes = logs;
        this.cdr.detectChanges();
      }
    });
  }

  generarBarras(reservas: Reserva[]): void {
  const diasNombres = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
  const lunes = new Date();
  const dia = lunes.getDay();
  lunes.setDate(lunes.getDate() - (dia === 0 ? 6 : dia - 1));
  lunes.setHours(0, 0, 0, 0);

  const conteos = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(lunes);
    d.setDate(lunes.getDate() + i);
    const fechaStr = this.formatFecha(d);
    return {
      label: diasNombres[i],
      count: reservas.filter(r => r.fecha === fechaStr && r.estado !== 'cancelada').length
    };
  });

  const max = Math.max(...conteos.map(c => c.count), 1);
  const maxCount = Math.max(...conteos.map(c => c.count));
  const maxAlturaPx = 120; // altura máxima en px dentro del contenedor de 160px

  this.barData = conteos.map(c => ({
    height: Math.max((c.count / max) * maxAlturaPx, c.count > 0 ? 8 : 4),
    highlight: c.count === maxCount && maxCount > 0,
    label: c.label,
    count: c.count
  }));
}

  getDonaOffset(index: number): number {
    const total = this.estadosReservas.reduce((sum, e) => sum + e.count, 0);
    if (total === 0) return 0;
    let offset = 0;
    for (let i = 0; i < index; i++) {
      offset += (this.estadosReservas[i].count / total) * 100;
    }
    return offset;
  }

  getDonaLongitud(count: number): number {
    const total = this.estadosReservas.reduce((sum, e) => sum + e.count, 0);
    if (total === 0) return 0;
    return (count / total) * 100;
  }

  getTipoLogIcon(tipo: string): string {
    const icons: Record<string, string> = {
      'LOGIN_EXITOSO': 'login',
      'LOGIN_FALLIDO': 'no_accounts',
      'LOGOUT': 'logout',
      'ACCION_USUARIO': 'person'
    };
    return icons[tipo] || 'info';
  }

  getTipoLogColor(tipo: string): string {
    const colors: Record<string, string> = {
      'LOGIN_EXITOSO': '#a8e6a3',
      'LOGIN_FALLIDO': '#ffb4ab',
      'LOGOUT': '#7eb8f7',
      'ACCION_USUARIO': '#e3c190'
    };
    return colors[tipo] || '#999';
  }

  formatFechaHora(fechaHora: string): string {
    const d = new Date(fechaHora);
    return d.toLocaleString('es-CO', {
      day: '2-digit', month: '2-digit',
      hour: '2-digit', minute: '2-digit'
    });
  }

  irNuevaReserva(): void {
    this.router.navigate(['/dashboard/admin/reservas']);
  }

  cerrarSesion(): void {
    localStorage.clear();
    this.router.navigate(['/login']);
  }
}