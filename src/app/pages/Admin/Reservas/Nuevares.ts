import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { Navbar } from '../../../components/navbar/navbar';
import { environment } from 'environments/environment';

interface ServicioBackend {
  idServicio: number;
  nombre: string;
  descripcion: string;
  precio: number;
  duracionMinutos: number;
  estado: string;
  imagenUrl?: string;
}

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

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

@Component({
  selector: 'app-reservas',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, Navbar],
  templateUrl: './Nuevares.html',
  styleUrls: ['./Nuevares.css'],
})
export class ReservasComponent implements OnInit {

  private apiUrl = environment.apiUrl;

  // ── Rol
  esCliente: boolean = false;
  rol: string = '';

  // ── Servicios
  servicios: ServicioBackend[] = [];
  serviciosFiltrados: ServicioBackend[] = [];
  serviciosSeleccionados: ServicioBackend[] = [];
  searchQuery: string = '';

  // ── Terapeutas
  terapeutas: Usuario[] = [];
  terapeutaSeleccionado: Usuario | null = null;

  // ── Cliente
  clienteBusqueda: string = '';
  clientesEncontrados: Usuario[] = [];
  clienteSeleccionado: Usuario | null = null;
  buscandoCliente: boolean = false;
  private busquedaTimeout: any = null;

  // ── Disponibilidad
  verificandoDisponibilidad: boolean = false;
  mensajeDisponibilidad: string = '';
  horasOcupadas: string[] = [];
  cargandoDisponibilidad: boolean = false;

  // ── Calendario mini
  hoy = new Date();
  mesActual: Date = new Date(this.hoy.getFullYear(), this.hoy.getMonth(), 1);
  fechaSeleccionada: Date | null = null;
  diasCalendario: (Date | null)[] = [];
  nombresMeses = ['Enero','Febrero','Marzo','Abril','Mayo','Junio',
                  'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
  nombresDias = ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'];

  // ── Hora
  horaSeleccionada: string = '';
  horaManual: string = '';
  usarHoraManual: boolean = false;
  horas: string[] = [
    '08:00:00','09:00:00','10:00:00','11:00:00','12:00:00',
    '13:00:00','14:00:00','15:00:00','16:00:00','17:00:00','18:00:00'
  ];

  // ── UI
  toasts: Toast[] = [];
  isSubmitting: boolean = false;
  readonly placeholder = 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=600&q=80';

  // ── Calendario Modal
  mostrarCalendario: boolean = false;
  reservas: Reserva[] = [];
  semanaActual: Date = new Date();
  diasSemana: Date[] = [];
  horasCalendario: string[] = [
    '08:00','09:00','10:00','11:00','12:00',
    '13:00','14:00','15:00','16:00','17:00','18:00'
  ];

  constructor(
    private http: HttpClient,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.rol = localStorage.getItem('rol') || '';
    this.esCliente = this.rol === 'cliente';

    this.cargarServicios();
    this.generarCalendario();

    if (!this.esCliente) {
      this.cargarTerapeutas();
    }

    this.route.queryParams.subscribe(params => {
      if (params['fecha']) {
        const partes = params['fecha'].split('-');
        this.fechaSeleccionada = new Date(+partes[0], +partes[1]-1, +partes[2]);
        this.mesActual = new Date(+partes[0], +partes[1]-1, 1);
        this.generarCalendario();
      }
      if (params['hora']) {
        this.horaSeleccionada = params['hora'];
      }
    });
  }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }

  // ─── Servicios ────────────────────────────────────────────────

  cargarServicios(): void {
    this.http.get<ServicioBackend[]>(`${this.apiUrl}/servicios`, { headers: this.getHeaders() }).subscribe({
      next: (data) => {
        this.servicios = data.filter(s => s.estado === 'activo');
        this.serviciosFiltrados = [...this.servicios];
        this.cdr.detectChanges();
      },
      error: () => this.showToast('Error al cargar servicios', 'error')
    });
  }

  filtrarServicios(): void {
    const q = this.searchQuery.trim().toLowerCase();
    if (!q) { this.serviciosFiltrados = [...this.servicios]; return; }
    this.serviciosFiltrados = this.servicios.filter(s =>
      s.nombre.toLowerCase().includes(q) || s.descripcion?.toLowerCase().includes(q)
    );
  }

  limpiarBusqueda(): void {
    this.searchQuery = '';
    this.filtrarServicios();
  }

  seleccionarServicio(s: ServicioBackend): void {
    const idx = this.serviciosSeleccionados.findIndex(x => x.idServicio === s.idServicio);
    if (idx >= 0) {
      this.serviciosSeleccionados = this.serviciosSeleccionados.filter(x => x.idServicio !== s.idServicio);
    } else {
      this.serviciosSeleccionados = [...this.serviciosSeleccionados, s];
    }
    this.mensajeDisponibilidad = '';
    // Si ya hay fecha seleccionada, recalcular disponibilidad con nueva duración
    if (this.esCliente && this.fechaSeleccionada) {
      this.verificarDisponibilidadDia(this.fechaSeleccionada);
    }
  }

  estaSeleccionado(s: ServicioBackend): boolean {
    return this.serviciosSeleccionados.some(x => x.idServicio === s.idServicio);
  }

  onImgError(event: Event): void {
    (event.target as HTMLImageElement).src = this.placeholder;
  }

  // ─── Terapeutas ───────────────────────────────────────────────

  cargarTerapeutas(): void {
    this.http.get<Usuario[]>(`${this.apiUrl}/usuarios`, { headers: this.getHeaders() }).subscribe({
      next: (data) => {
        this.terapeutas = data.filter(u => u.rol === 'terapeuta' && u.estado === 'activo');
        this.cdr.detectChanges();
      },
      error: () => this.showToast('Error al cargar terapeutas', 'error')
    });
  }

  seleccionarTerapeuta(t: Usuario): void {
    this.terapeutaSeleccionado = t;
  }

  // ─── Cliente ──────────────────────────────────────────────────

  buscarCliente(): void {
    clearTimeout(this.busquedaTimeout);
    if (!this.clienteBusqueda.trim()) { this.clientesEncontrados = []; return; }
    this.busquedaTimeout = setTimeout(() => {
      this.buscandoCliente = true;
      this.http.get<Usuario[]>(
        `${this.apiUrl}/usuarios/buscar?nombre=${this.clienteBusqueda}`,
        { headers: this.getHeaders() }
      ).subscribe({
        next: (data) => {
          this.clientesEncontrados = data.filter(u => u.rol === 'cliente');
          this.buscandoCliente = false;
          this.cdr.detectChanges();
        },
        error: () => { this.buscandoCliente = false; this.showToast('Error al buscar cliente', 'error'); }
      });
    }, 400);
  }

  elegirCliente(u: Usuario): void {
    this.clienteSeleccionado = u;
    this.clienteBusqueda = u.nombre;
    this.clientesEncontrados = [];
  }

  limpiarCliente(): void {
    this.clienteSeleccionado = null;
    this.clienteBusqueda = '';
    this.clientesEncontrados = [];
  }

  // ─── Calendario mini ──────────────────────────────────────────

  generarCalendario(): void {
    const year = this.mesActual.getFullYear();
    const month = this.mesActual.getMonth();
    const primerDia = new Date(year, month, 1).getDay();
    const diasEnMes = new Date(year, month + 1, 0).getDate();
    this.diasCalendario = [];
    for (let i = 0; i < primerDia; i++) this.diasCalendario.push(null);
    for (let d = 1; d <= diasEnMes; d++) this.diasCalendario.push(new Date(year, month, d));
  }

  mesAnterior(): void {
    this.mesActual = new Date(this.mesActual.getFullYear(), this.mesActual.getMonth() - 1, 1);
    this.generarCalendario();
  }

  mesSiguiente(): void {
    this.mesActual = new Date(this.mesActual.getFullYear(), this.mesActual.getMonth() + 1, 1);
    this.generarCalendario();
  }

  seleccionarFecha(dia: Date | null): void {
    if (!dia || dia < this.hoy) return;
    this.fechaSeleccionada = dia;
    this.mensajeDisponibilidad = '';
    this.horaSeleccionada = '';
    this.horasOcupadas = [];
    if (this.esCliente) {
      this.verificarDisponibilidadDia(dia);
    }
  }

  verificarDisponibilidadDia(dia: Date): void {
    this.cargandoDisponibilidad = true;
    const fecha = this.formatFecha(dia);
    const duracion = this.duracionTotal > 0 ? this.duracionTotal : 60;

    this.http.get<any>(
      `${this.apiUrl}/reservas/disponibilidad-semana?fechaInicio=${fecha}&fechaFin=${fecha}&duracionMinutos=${duracion}`,
      { headers: this.getHeaders() }
    ).subscribe({
      next: (data) => {
        this.horasOcupadas = Object.entries(data.slots)
          .filter(([_, disponible]) => !disponible)
          .map(([slot]) => (slot as string).split('T')[1] + ':00');
        this.cargandoDisponibilidad = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.cargandoDisponibilidad = false;
      }
    });
  }

  estaOcupada(hora: string): boolean {
    return this.horasOcupadas.includes(hora);
  }

  clickHora(h: string): void {
  if (this.estaOcupada(h)) {
    this.mensajeDisponibilidad = 'No hay terapeutas disponibles en este horario. Elige otra hora.';
  } else {
    this.horaSeleccionada = h;
    this.mensajeDisponibilidad = '';
  }
}

  esFechaSeleccionada(dia: Date | null): boolean {
    if (!dia || !this.fechaSeleccionada) return false;
    return dia.toDateString() === this.fechaSeleccionada.toDateString();
  }

  esPasado(dia: Date | null): boolean {
    if (!dia) return false;
    const hoy = new Date(); hoy.setHours(0, 0, 0, 0);
    return dia < hoy;
  }

  esHoyMini(dia: Date | null): boolean {
    if (!dia) return false;
    return dia.toDateString() === this.hoy.toDateString();
  }

  getFechaFormateada(): string {
    if (!this.fechaSeleccionada) return '';
    const y = this.fechaSeleccionada.getFullYear();
    const m = String(this.fechaSeleccionada.getMonth() + 1).padStart(2, '0');
    const d = String(this.fechaSeleccionada.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  // ─── Hora ─────────────────────────────────────────────────────

  get horaFinal(): string {
    if (this.usarHoraManual) {
      return this.horaManual ? this.horaManual + ':00' : '';
    }
    return this.horaSeleccionada;
  }

  get duracionTotal(): number {
    return this.serviciosSeleccionados.reduce((sum, s) => sum + s.duracionMinutos, 0);
  }

  // ─── Reserva ──────────────────────────────────────────────────

  calcularSubtotal(): number {
    return this.serviciosSeleccionados.reduce((sum, s) => sum + s.precio, 0);
  }

  puedeConfirmar(): boolean {
    if (this.esCliente) {
      return !!(
        this.serviciosSeleccionados.length > 0 &&
        this.fechaSeleccionada &&
        this.horaFinal
      );
    }
    return !!(
      this.serviciosSeleccionados.length > 0 &&
      this.terapeutaSeleccionado &&
      this.clienteSeleccionado &&
      this.fechaSeleccionada &&
      this.horaFinal
    );
  }

  confirmarReserva(): void {
    if (!this.puedeConfirmar() || this.isSubmitting) return;
    if (this.esCliente) {
      this.confirmarReservaCliente();
    } else {
      this.confirmarReservaAdmin();
    }
  }

  confirmarReservaCliente(): void {
    this.isSubmitting = true;
    this.verificandoDisponibilidad = true;
    this.mensajeDisponibilidad = '';

    this.http.get<any>(
      `${this.apiUrl}/reservas/terapeuta-disponible?fecha=${this.getFechaFormateada()}&horaInicio=${this.horaFinal}&duracionMinutos=${this.duracionTotal}`,
      { headers: this.getHeaders() }
    ).subscribe({
      next: (terapeuta) => {
        this.verificandoDisponibilidad = false;
        const body = {
          idTerapeuta: terapeuta.idTerapeuta,
          idServicios: this.serviciosSeleccionados.map(s => s.idServicio),
          fecha: this.getFechaFormateada(),
          horaInicio: this.horaFinal
        };
        this.http.post(`${this.apiUrl}/reservas`, body, { headers: this.getHeaders() }).subscribe({
          next: () => {
            this.showToast('Reserva creada exitosamente', 'success');
            this.isSubmitting = false;
            setTimeout(() => this.router.navigate(['/dashboard/cliente']), 1500);
          },
          error: (err) => {
            const msg = err?.error?.message || 'Error al crear la reserva';
            this.showToast(msg, 'error');
            this.isSubmitting = false;
          }
        });
      },
      error: (err) => {
        this.verificandoDisponibilidad = false;
        this.isSubmitting = false;
        if (err.status === 204 || err.status === 404) {
          this.mensajeDisponibilidad = 'No hay terapeutas disponibles en este horario. Por favor elige otra hora.';
        } else {
          this.mensajeDisponibilidad = 'Error al verificar disponibilidad.';
        }
      }
    });
  }

  confirmarReservaAdmin(): void {
    this.isSubmitting = true;
    const body = {
      idCliente: this.clienteSeleccionado!.id,
      idServicios: this.serviciosSeleccionados.map(s => s.idServicio),
      idTerapeuta: this.terapeutaSeleccionado!.id,
      fecha: this.getFechaFormateada(),
      horaInicio: this.horaFinal
    };
    this.http.post(`${this.apiUrl}/reservas`, body, { headers: this.getHeaders() }).subscribe({
      next: () => {
        this.showToast('Reserva creada exitosamente', 'success');
        this.isSubmitting = false;
        const ruta = this.rol === 'recepcionista'
          ? '/dashboard/recepcionista/reservas'
          : '/dashboard/admin/reservas';
        setTimeout(() => this.router.navigate([ruta]), 1500);
      },
      error: (err) => {
        const msg = err?.error?.message || 'Error al crear la reserva';
        this.showToast(msg, 'error');
        this.isSubmitting = false;
      }
    });
  }

  resetForm(): void {
    this.serviciosSeleccionados = [];
    this.terapeutaSeleccionado = null;
    this.clienteSeleccionado = null;
    this.clienteBusqueda = '';
    this.fechaSeleccionada = null;
    this.horaSeleccionada = '';
    this.horaManual = '';
    this.usarHoraManual = false;
    this.searchQuery = '';
    this.mensajeDisponibilidad = '';
    this.horasOcupadas = [];
    this.filtrarServicios();
  }

  // ─── Calendario Modal ─────────────────────────────────────────

  abrirCalendario(): void {
    this.mostrarCalendario = true;
    this.generarSemana();
    this.cargarReservas();
  }

  cerrarCalendario(): void {
    this.mostrarCalendario = false;
  }

  cargarReservas(): void {
    const endpoint = this.esCliente
      ? `${this.apiUrl}/reservas/mis-reservas`
      : `${this.apiUrl}/reservas`;
    this.http.get<Reserva[]>(endpoint, { headers: this.getHeaders() }).subscribe({
      next: (data) => { this.reservas = data; this.cdr.detectChanges(); },
      error: () => this.showToast('Error al cargar reservas', 'error')
    });
  }

  generarSemana(): void {
    const inicio = new Date(this.semanaActual);
    const dia = inicio.getDay();
    const diff = inicio.getDate() - dia + (dia === 0 ? -6 : 1);
    inicio.setDate(diff);
    this.diasSemana = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(inicio);
      d.setDate(inicio.getDate() + i);
      return d;
    });
  }

  semanaAnterior(): void {
    this.semanaActual = new Date(this.semanaActual);
    this.semanaActual.setDate(this.semanaActual.getDate() - 7);
    this.generarSemana();
  }

  semanaSiguiente(): void {
    this.semanaActual = new Date(this.semanaActual);
    this.semanaActual.setDate(this.semanaActual.getDate() + 7);
    this.generarSemana();
  }

  getReservasDia(dia: Date): Reserva[] {
    return this.reservas.filter(r => r.fecha === this.formatFecha(dia));
  }

  formatFecha(d: Date): string {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${dd}`;
  }

  getTopOffset(horaInicio: string): number {
    const [h, m] = horaInicio.split(':').map(Number);
    return ((h - 8) * 60 + m) * (50 / 60);
  }

  getAltura(horaInicio: string, horaFin: string): number {
    const [h1, m1] = horaInicio.split(':').map(Number);
    const [h2, m2] = horaFin.split(':').map(Number);
    return Math.max(((h2 * 60 + m2) - (h1 * 60 + m1)) * (50 / 60), 30);
  }

  getNombreDia(dia: Date): string {
    return ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'][dia.getDay()];
  }

  esHoy(dia: Date): boolean {
    return dia.toDateString() === new Date().toDateString();
  }

  getSemanaLabel(): string {
    if (this.diasSemana.length === 0) return '';
    const ini = this.diasSemana[0];
    const fin = this.diasSemana[6];
    return `${ini.getDate()} - ${fin.getDate()} ${this.nombresMeses[fin.getMonth()]} ${fin.getFullYear()}`;
  }

  // ─── Toasts ───────────────────────────────────────────────────

  showToast(message: string, type: 'success' | 'error' | 'info' = 'info'): void {
    const toast: Toast = { id: crypto.randomUUID(), message, type };
    this.toasts.push(toast);
    setTimeout(() => { this.toasts = this.toasts.filter(t => t.id !== toast.id); }, 3000);
  }
}