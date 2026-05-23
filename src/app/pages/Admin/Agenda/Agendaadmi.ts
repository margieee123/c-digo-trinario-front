import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { Navbar } from '../../../components/navbar/navbar';
import { environment } from 'environments/environment';

interface Usuario {
  id: number;
  nombre: string;
  correo: string;
  rol: string;
  estado: string;
}

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

interface ServicioBackend {
  idServicio: number;
  nombre: string;
  descripcion: string;
  precio: number;
  duracionMinutos: number;
  estado: string;
}

@Component({
  selector: 'app-agendaadmi',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, Navbar],
  templateUrl: './Agendaadmi.html',
  styleUrls: ['./Agendaadmi.css']
})
export class Agendaadmi implements OnInit {

  private apiUrl = environment.apiUrl;
  nombre: string = '';
  semanaLabel: string = '';
  private lunesActual: Date = new Date();

  // Rol
  esTerapeuta: boolean = false;
  rol: string = '';

  // Datos
  todasReservas: Reserva[] = [];
  terapeutas: Usuario[] = [];
  todosServicios: ServicioBackend[] = [];

  // Filtros
  filtroTerapeuta: number = 0;
  filtroEstado: string = '';
  estadosDisponibles = ['pendiente', 'confirmada', 'en_proceso', 'finalizada', 'cancelada'];

  // Calendario
  diasSemana: Date[] = [];
  horasCalendario: number[] = [7,8,9,10,11,12,13,14,15,16,17,18,19,20];
  readonly alturaHora = 60;
  horaActual: Date = new Date();

  // Colores por terapeuta
  private coloresTerapeutas: Map<number, string> = new Map();
  private paleta = [
    '#e3c190','#7eb8f7','#a8e6a3','#f7a8d0','#b8a8f7',
    '#f7d4a8','#a8f7f0','#f7a8a8','#c8f7a8','#f7f0a8'
  ];

  // Pulse
  pulse = { citasHoy: 0, ingresosSemana: '$0', citasSemana: 0 };

  // Modal editar reserva
  showEditModal = false;
  reservaEditando: Reserva | null = null;
  editForm = { fecha: '', horaInicio: '', idTerapeuta: 0, estado: '' };
  isSubmitting = false;

  // Modal editar servicios
  showEditServiciosModal = false;
  serviciosSeleccionados: number[] = [];
  isSubmittingServicios = false;

  // Tooltip
  tooltipReserva: Reserva | null = null;
  tooltipX = 0;
  tooltipY = 0;

  constructor(
    private router: Router,
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.nombre = localStorage.getItem('nombre') || 'Administrador';
    this.rol = localStorage.getItem('rol') || '';
    this.esTerapeuta = this.rol === 'terapeuta';
    this.lunesActual = this.getLunes(new Date());
    this.generarSemana();
    this.cargarReservasSemana();
    this.cargarUsuarios();
    this.cargarServicios();

    setInterval(() => {
      this.horaActual = new Date();
      this.cdr.detectChanges();
    }, 60000);
  }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
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

  generarSemana(): void {
    this.diasSemana = Array.from({length: 7}, (_, i) => {
      const d = new Date(this.lunesActual);
      d.setDate(this.lunesActual.getDate() + i);
      return d;
    });
    const fin = this.diasSemana[6];
    const meses = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
    this.semanaLabel = `${this.lunesActual.getDate()} - ${fin.getDate()} ${meses[fin.getMonth()]} ${fin.getFullYear()}`;
  }

  semanaAnterior(): void {
    this.lunesActual = new Date(this.lunesActual);
    this.lunesActual.setDate(this.lunesActual.getDate() - 7);
    this.generarSemana();
    this.cargarReservasSemana();
  }

  semanaSiguiente(): void {
    this.lunesActual = new Date(this.lunesActual);
    this.lunesActual.setDate(this.lunesActual.getDate() + 7);
    this.generarSemana();
    this.cargarReservasSemana();
  }

  cargarUsuarios(): void {
    this.http.get<Usuario[]>(`${this.apiUrl}/usuarios`, { headers: this.getHeaders() }).subscribe({
      next: (usuarios) => {
        this.terapeutas = usuarios.filter(u => u.rol === 'terapeuta' && u.estado === 'activo');
        this.terapeutas.forEach((t, i) => {
          this.coloresTerapeutas.set(t.id, this.paleta[i % this.paleta.length]);
        });
        this.cdr.detectChanges();
      },
      error: () => console.error('Error al cargar usuarios')
    });
  }

  cargarServicios(): void {
    this.http.get<ServicioBackend[]>(`${this.apiUrl}/servicios`, { headers: this.getHeaders() }).subscribe({
      next: (data) => {
        this.todosServicios = data.filter(s => s.estado === 'activo');
        this.cdr.detectChanges();
      }
    });
  }

  cargarReservasSemana(): void {
    const domingo = new Date(this.lunesActual);
    domingo.setDate(this.lunesActual.getDate() + 6);

    let url = `${this.apiUrl}/reservas/filtrar?fechaInicio=${this.formatFecha(this.lunesActual)}&fechaFin=${this.formatFecha(domingo)}`;
    if (this.filtroTerapeuta && Number(this.filtroTerapeuta) !== 0) url += `&idTerapeuta=${this.filtroTerapeuta}`;
    if (this.filtroEstado) url += `&estado=${this.filtroEstado}`;

    this.http.get<Reserva[]>(url, { headers: this.getHeaders() }).subscribe({
      next: (reservas) => {
        this.todasReservas = reservas;
        this.actualizarPulse();
        this.cdr.detectChanges();
      },
      error: () => console.error('Error al cargar reservas')
    });
  }

  onFiltroChange(): void {
    this.cargarReservasSemana();
  }

  actualizarPulse(): void {
    const hoy = this.formatFecha(new Date());
    const reservasHoy = this.todasReservas.filter(r => r.fecha === hoy && r.estado !== 'cancelada');
    this.pulse.citasHoy = reservasHoy.length;
    this.pulse.citasSemana = this.todasReservas.filter(r => r.estado !== 'cancelada').length;
    const ingresos = this.todasReservas
      .filter(r => r.estado !== 'cancelada')
      .reduce((sum, r) => sum + (r.totalServicios || 0), 0);
    this.pulse.ingresosSemana = '$' + ingresos.toLocaleString();
  }

  getReservasDia(dia: Date): Reserva[] {
    return this.todasReservas.filter(r => r.fecha === this.formatFecha(dia));
  }

  getColorTerapeuta(idTerapeuta: number): string {
    return this.coloresTerapeutas.get(idTerapeuta) || '#e3c190';
  }

  getColorFondo(idTerapeuta: number): string {
    return this.getColorTerapeuta(idTerapeuta) + '22';
  }

  contarCitasDia(dia: Date): number {
    return this.getReservasDia(dia).length;
  }

  esHoy(dia: Date): boolean {
    return this.formatFecha(dia) === this.formatFecha(new Date());
  }

  getTop(horaInicio: string): number {
    const [h, m] = horaInicio.split(':').map(Number);
    return ((h - this.horasCalendario[0]) * 60 + m) * (this.alturaHora / 60);
  }

  getAltura(horaInicio: string, horaFin: string): number {
    const [h1, m1] = horaInicio.split(':').map(Number);
    const [h2, m2] = horaFin.split(':').map(Number);
    return Math.max(((h2 * 60 + m2) - (h1 * 60 + m1)) * (this.alturaHora / 60), 30);
  }

  getLineaHoraActual(): number {
    const h = this.horaActual.getHours();
    const m = this.horaActual.getMinutes();
    return ((h - this.horasCalendario[0]) * 60 + m) * (this.alturaHora / 60);
  }

  esSemanaActual(): boolean {
    const hoy = this.formatFecha(new Date());
    return this.diasSemana.some(d => this.formatFecha(d) === hoy);
  }

  clickSlotVacio(dia: Date, hora: number): void {
    if (this.esTerapeuta) return;

    const fecha = this.formatFecha(dia);
    const horaStr = String(hora).padStart(2, '0') + ':00:00';

    if (this.rol === 'recepcionista') {
      this.router.navigate(['/dashboard/recepcionista/reservas'], {
        queryParams: { fecha, hora: horaStr }
      });
    } else {
      this.router.navigate(['/dashboard/admin/reservas'], {
        queryParams: { fecha, hora: horaStr }
      });
    }
  }

  mostrarTooltip(event: MouseEvent, reserva: Reserva): void {
    this.tooltipReserva = reserva;
    this.tooltipX = event.clientX + 12;
    this.tooltipY = event.clientY + 12;
  }

  ocultarTooltip(): void {
    this.tooltipReserva = null;
  }

  // ─── Modal editar reserva ─────────────────────────────────────

  abrirEditModal(reserva: Reserva, event: MouseEvent): void {
    event.stopPropagation();
    this.reservaEditando = reserva;
    this.editForm = {
      fecha: reserva.fecha,
      horaInicio: reserva.horaInicio.slice(0, 5),
      idTerapeuta: reserva.idTerapeuta,
      estado: reserva.estado
    };
    this.showEditModal = true;
    document.body.style.overflow = 'hidden';
  }

  cerrarEditModal(): void {
    this.showEditModal = false;
    this.isSubmitting = false;
    document.body.style.overflow = '';
  }

  guardarCambios(): void {
    if (!this.reservaEditando || this.isSubmitting) return;
    this.isSubmitting = true;

    this.http.patch(
      `${this.apiUrl}/reservas/${this.reservaEditando.idReserva}/estado?estado=${this.editForm.estado}`,
      {},
      { headers: this.getHeaders() }
    ).subscribe({
      next: () => {
        this.cerrarEditModal();
        this.cargarReservasSemana();
      },
      error: () => { this.isSubmitting = false; }
    });
  }

  // ─── Modal editar servicios ───────────────────────────────────

  abrirEditServicios(event: MouseEvent): void {
    event.stopPropagation();
    if (!this.reservaEditando) return;
    this.serviciosSeleccionados = [...(this.reservaEditando.idServicios || [])];
    this.showEditServiciosModal = true;
  }

  cerrarEditServicios(): void {
    this.showEditServiciosModal = false;
    this.serviciosSeleccionados = [];
    this.isSubmittingServicios = false;
  }

  toggleServicio(idServicio: number): void {
    const idx = this.serviciosSeleccionados.indexOf(idServicio);
    if (idx >= 0) {
      this.serviciosSeleccionados = this.serviciosSeleccionados.filter(id => id !== idServicio);
    } else {
      this.serviciosSeleccionados = [...this.serviciosSeleccionados, idServicio];
    }
  }

  estaSeleccionado(idServicio: number): boolean {
    return this.serviciosSeleccionados.includes(idServicio);
  }

  guardarServicios(): void {
    if (!this.reservaEditando || this.serviciosSeleccionados.length === 0 || this.isSubmittingServicios) return;
    this.isSubmittingServicios = true;

    this.http.patch<Reserva>(
      `${this.apiUrl}/reservas/${this.reservaEditando.idReserva}/servicios`,
      this.serviciosSeleccionados,
      { headers: this.getHeaders() }
    ).subscribe({
      next: () => {
        this.cerrarEditServicios();
        this.cerrarEditModal();
        this.cargarReservasSemana();
      },
      error: () => { this.isSubmittingServicios = false; }
    });
  }

  cerrarSesion(): void {
    localStorage.clear();
    this.router.navigate(['/login']);
  }
}