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

interface Servicio {
  idServicio: number;
  nombre: string;
  descripcion: string;
  precio: number;
  duracionMinutos: number;
  estado: string;
  imagenUrl: string;
}

interface DiaCalendario {
  fecha: Date;
  esHoy: boolean;
  esMesActual: boolean;
  reservas: Reserva[];
}

@Component({
  selector: 'app-iniciocliente',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, Navbar],
  templateUrl: './iniciocliente.html',
  styleUrls: ['./iniciocliente.css']
})
export class InicioclienteComponent implements OnInit {

  private apiUrl = environment.apiUrl;

  nombre: string = '';
  fechaHoy: string = '';

  // Reservas
  misReservas: Reserva[] = [];
  proximaReserva: Reserva | null = null;

  // Servicios
  servicios: Servicio[] = [];

  // Calendario tipo Google
  lunesActual: Date = new Date();
  semana: DiaCalendario[] = [];
  horasCalendario: number[] = Array.from({ length: 14 }, (_, i) => i + 7);
  diasSemanaLabel = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
  meses = ['Enero','Febrero','Marzo','Abril','Mayo','Junio',
           'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];

  // Modal nueva reserva
  modalAbierto = false;
  modalCancelarAbierto = false;
  reservaParaCancelar: Reserva | null = null;
  fechaSeleccionada: string = '';
  horaSeleccionada: string = '';
  serviciosSeleccionados: number[] = [];
  creandoReserva = false;
  verificandoDisponibilidad = false;
  mensajeDisponibilidad = '';
  toasts: { id: string; message: string; type: string }[] = [];

  // Modal detalle reserva
  modalDetalleAbierto = false;
  reservaDetalle: Reserva | null = null;

  // Modal editar reserva
  showEditModal = false;
  reservaEditando: Reserva | null = null;
  editForm = { fecha: '', horaInicio: '' };
  serviciosEditando: number[] = [];
  showEditServiciosModal = false;
  isSubmittingEdit = false;
  isSubmittingServicios = false;
  mensajeEditDisponibilidad = '';

  // Calificación
  calificacion: number = 0;
  comentario: string = '';

  constructor(
    private router: Router,
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.nombre = localStorage.getItem('nombre') || 'Cliente';
    const hoy = new Date();
    this.fechaHoy = hoy.toLocaleDateString('es-ES', {
      weekday: 'long', day: 'numeric', month: 'long'
    });
    this.lunesActual = this.getLunes(hoy);
    this.cargarDatos();
  }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }

  cargarDatos(): void {
    this.cargarReservas();
    this.cargarServicios();
  }

  cargarReservas(): void {
    this.http.get<Reserva[]>(
      `${this.apiUrl}/reservas/mis-reservas`,
      { headers: this.getHeaders() }
    ).subscribe({
      next: (data) => {
        this.misReservas = data.sort((a, b) => b.fecha.localeCompare(a.fecha));
        const hoy = this.formatFecha(new Date());
        this.proximaReserva = data
          .filter(r => r.fecha >= hoy && r.estado !== 'cancelada' && r.estado !== 'finalizada')
          .sort((a, b) => a.fecha.localeCompare(b.fecha))[0] || null;
        this.generarSemana();
        this.cdr.detectChanges();
      },
      error: () => console.error('Error al cargar reservas')
    });
  }

  cargarServicios(): void {
    this.http.get<Servicio[]>(`${this.apiUrl}/servicios`, { headers: this.getHeaders() }).subscribe({
      next: (data) => {
        this.servicios = data.filter(s => s.estado === 'activo');
        this.cdr.detectChanges();
      }
    });
  }

  // ─── Calendario tipo Google ───────────────────────────────

  generarSemana(): void {
    this.semana = [];
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    for (let i = 0; i < 7; i++) {
      const fecha = new Date(this.lunesActual);
      fecha.setDate(this.lunesActual.getDate() + i);
      const fechaStr = this.formatFecha(fecha);

      const reservasDelDia = this.misReservas.filter(r =>
        r.fecha === fechaStr && r.estado !== 'cancelada'
      );

      this.semana.push({
        fecha,
        esHoy: fecha.getTime() === hoy.getTime(),
        esMesActual: fecha.getMonth() === hoy.getMonth(),
        reservas: reservasDelDia
      });
    }
  }

  semanaAnterior(): void {
    const nueva = new Date(this.lunesActual);
    nueva.setDate(nueva.getDate() - 7);
    this.lunesActual = nueva;
    this.generarSemana();
  }

  semanaSiguiente(): void {
    const nueva = new Date(this.lunesActual);
    nueva.setDate(nueva.getDate() + 7);
    this.lunesActual = nueva;
    this.generarSemana();
  }

  get semanaLabel(): string {
    const fin = new Date(this.lunesActual);
    fin.setDate(fin.getDate() + 6);
    return `${this.lunesActual.getDate()} ${this.meses[this.lunesActual.getMonth()]} — ${fin.getDate()} ${this.meses[fin.getMonth()]} ${fin.getFullYear()}`;
  }

  getReservaEnSlot(dia: DiaCalendario, hora: number): Reserva | null {
    return dia.reservas.find(r => {
      const h = parseInt(r.horaInicio.split(':')[0]);
      return h === hora;
    }) || null;
  }

  getAltoEvento(reserva: Reserva): number {
    const inicio = parseInt(reserva.horaInicio.split(':')[0]) * 60 + parseInt(reserva.horaInicio.split(':')[1]);
    const fin = parseInt(reserva.horaFin.split(':')[0]) * 60 + parseInt(reserva.horaFin.split(':')[1]);
    const duracion = fin - inicio;
    return Math.max((duracion / 60) * 56, 28);
  }

  getEstadoColorCalendario(estado: string): string {
    const colors: Record<string, string> = {
      'pendiente': 'evento--pendiente',
      'confirmada': 'evento--confirmada',
      'en_proceso': 'evento--proceso',
      'finalizada': 'evento--finalizada',
      'cancelada': 'evento--cancelada'
    };
    return colors[estado] || 'evento--pendiente';
  }

  // ─── Click en slot vacío ──────────────────────────────────

  clickSlotVacio(dia: DiaCalendario, hora: number): void {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    if (dia.fecha < hoy) return;

    const fecha = this.formatFecha(dia.fecha);
    const horaStr = String(hora).padStart(2, '0') + ':00:00';
    this.router.navigate(['/dashboard/cliente/reservas'], {
      queryParams: { fecha, hora: horaStr }
    });
  }

  clickReserva(reserva: Reserva, event: MouseEvent): void {
    event.stopPropagation();
    this.reservaDetalle = reserva;
    this.modalDetalleAbierto = true;
  }

  // ─── Modal editar reserva ─────────────────────────────────

  abrirEditModal(reserva: Reserva): void {
    this.reservaEditando = reserva;
    this.editForm = {
      fecha: reserva.fecha,
      horaInicio: reserva.horaInicio.slice(0, 5)
    };
    this.serviciosEditando = [...reserva.idServicios];
    this.mensajeEditDisponibilidad = '';
    this.showEditModal = true;
    this.modalDetalleAbierto = false;
    document.body.style.overflow = 'hidden';
  }

  cerrarEditModal(): void {
    this.showEditModal = false;
    this.isSubmittingEdit = false;
    this.mensajeEditDisponibilidad = '';
    document.body.style.overflow = '';
  }

  abrirEditServicios(event: MouseEvent): void {
    event.stopPropagation();
    this.showEditServiciosModal = true;
  }

  cerrarEditServicios(): void {
    this.showEditServiciosModal = false;
    this.isSubmittingServicios = false;
  }

  toggleServicioEdit(id: number): void {
    const idx = this.serviciosEditando.indexOf(id);
    if (idx >= 0) {
      this.serviciosEditando = this.serviciosEditando.filter(x => x !== id);
    } else {
      this.serviciosEditando = [...this.serviciosEditando, id];
    }
  }

  estaSeleccionadoEdit(id: number): boolean {
    return this.serviciosEditando.includes(id);
  }

  guardarEdicion(): void {
    if (!this.reservaEditando || this.isSubmittingEdit) return;
    if (this.serviciosEditando.length === 0) {
      this.mensajeEditDisponibilidad = 'Selecciona al menos un servicio.';
      return;
    }

    this.isSubmittingEdit = true;
    this.mensajeEditDisponibilidad = '';

    this.http.put<Reserva>(
      `${this.apiUrl}/reservas/${this.reservaEditando.idReserva}/cliente`,
      {
        idServicios: this.serviciosEditando,
        fecha: this.editForm.fecha,
        horaInicio: this.editForm.horaInicio + ':00'
      },
      { headers: this.getHeaders() }
    ).subscribe({
      next: () => {
        this.isSubmittingEdit = false;
        this.cerrarEditModal();
        this.showToast('Reserva actualizada exitosamente', 'success');
        this.cargarReservas();
      },
      error: (err) => {
        this.isSubmittingEdit = false;
        const msg = err?.error?.message || 'No hay disponibilidad en ese horario';
        this.mensajeEditDisponibilidad = msg;
      }
    });
  }

  // ─── Modal nueva reserva ──────────────────────────────────

  toggleServicio(id: number): void {
    const idx = this.serviciosSeleccionados.indexOf(id);
    if (idx === -1) {
      this.serviciosSeleccionados.push(id);
    } else {
      this.serviciosSeleccionados.splice(idx, 1);
    }
  }

  isServicioSeleccionado(id: number): boolean {
    return this.serviciosSeleccionados.includes(id);
  }

  get duracionTotal(): number {
    return this.serviciosSeleccionados.reduce((sum, id) => {
      const s = this.servicios.find(sv => sv.idServicio === id);
      return sum + (s?.duracionMinutos || 0);
    }, 0);
  }

  get precioTotal(): number {
    return this.serviciosSeleccionados.reduce((sum, id) => {
      const s = this.servicios.find(sv => sv.idServicio === id);
      return sum + (s?.precio || 0);
    }, 0);
  }

  crearReserva(): void {
    if (this.serviciosSeleccionados.length === 0) {
      this.showToast('Selecciona al menos un servicio', 'error');
      return;
    }

    this.creandoReserva = true;
    this.verificandoDisponibilidad = true;
    this.mensajeDisponibilidad = '';

    this.http.get<any>(
      `${this.apiUrl}/reservas/terapeuta-disponible?fecha=${this.fechaSeleccionada}&horaInicio=${this.horaSeleccionada}&duracionMinutos=${this.duracionTotal}`,
      { headers: this.getHeaders() }
    ).subscribe({
      next: (terapeuta) => {
        this.verificandoDisponibilidad = false;
        this.http.post<Reserva>(
          `${this.apiUrl}/reservas`,
          {
            idTerapeuta: terapeuta.idTerapeuta,
            idServicios: this.serviciosSeleccionados,
            fecha: this.fechaSeleccionada,
            horaInicio: this.horaSeleccionada
          },
          { headers: this.getHeaders() }
        ).subscribe({
          next: () => {
            this.creandoReserva = false;
            this.modalAbierto = false;
            this.showToast('Reserva creada exitosamente', 'success');
            this.cargarReservas();
          },
          error: () => {
            this.creandoReserva = false;
            this.showToast('Error al crear la reserva', 'error');
          }
        });
      },
      error: (err) => {
        this.verificandoDisponibilidad = false;
        this.creandoReserva = false;
        if (err.status === 204 || err.status === 404) {
          this.mensajeDisponibilidad = 'No hay terapeutas disponibles en este horario. Por favor elige otra hora.';
        } else {
          this.mensajeDisponibilidad = 'Error al verificar disponibilidad.';
        }
      }
    });
  }

  cerrarModal(): void {
    this.modalAbierto = false;
    this.mensajeDisponibilidad = '';
    this.serviciosSeleccionados = [];
  }

  // ─── Cancelar reserva ─────────────────────────────────────

  abrirModalCancelar(reserva: Reserva): void {
    this.reservaParaCancelar = reserva;
    this.modalCancelarAbierto = true;
    this.modalDetalleAbierto = false;
  }

  confirmarCancelacion(): void {
    if (!this.reservaParaCancelar) return;
    this.http.patch(
      `${this.apiUrl}/reservas/${this.reservaParaCancelar.idReserva}/cancelar`,
      {},
      { headers: this.getHeaders() }
    ).subscribe({
      next: () => {
        this.modalCancelarAbierto = false;
        this.reservaParaCancelar = null;
        this.showToast('Reserva cancelada', 'success');
        this.cargarReservas();
      },
      error: () => this.showToast('Error al cancelar', 'error')
    });
  }

  cancelarReserva(reserva: Reserva): void {
    this.abrirModalCancelar(reserva);
  }

  irANuevaReserva(): void {
    this.router.navigate(['/dashboard/cliente/reservas']);
  }

  // ─── Toasts ───────────────────────────────────────────────

  showToast(message: string, type: string): void {
    const toast = { id: Math.random().toString(36).slice(2), message, type };
    this.toasts.push(toast);
    setTimeout(() => {
      this.toasts = this.toasts.filter(t => t.id !== toast.id);
      this.cdr.detectChanges();
    }, 3000);
  }

  // ─── Calificación ─────────────────────────────────────────

  setCalificacion(valor: number): void {
    this.calificacion = valor;
  }

  enviarComentario(): void {
    this.comentario = '';
    this.calificacion = 0;
    this.showToast('Gracias por tu calificación', 'success');
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
}