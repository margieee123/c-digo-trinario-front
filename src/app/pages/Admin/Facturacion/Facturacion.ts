import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Navbar } from '../../../components/navbar/navbar';
import { environment } from 'environments/environment';

interface FacturaResponse {
  idFactura: number;
  idReserva: number;
  monto: number;
  fechaEmision: string;
  estadoPago: string;
  nombreCliente: string;
  nombreTerapeuta: string;
  fechaReserva: string;
  horaInicio: string;
  horaFin: string;
  nombresServicios: string[];
  estadoReserva: string;
}

interface ReservaResponse {
  idReserva: number;
  idServicios: number[];
  nombreCliente: string;
  nombreTerapeuta: string;
  nombresServicios: string[];
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

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

@Component({
  selector: 'app-facturacion',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, Navbar],
  templateUrl: './Facturacion.html',
  styleUrls: ['./Facturacion.css']
})
export class FacturacionComponent implements OnInit {

  private apiUrl = environment.apiUrl;

  facturas: FacturaResponse[] = [];
  facturasFiltradas: FacturaResponse[] = [];
  reservasSinFactura: ReservaResponse[] = [];
  todosServicios: ServicioBackend[] = [];
  toasts: Toast[] = [];

  filtroEstado: string = '';
  busqueda: string = '';
  estadosDisponibles = ['pendiente', 'pagado', 'anulada'];

  showDetalleModal = false;
  facturaDetalle: FacturaResponse | null = null;

  showGenerarModal = false;
  reservaSeleccionada: ReservaResponse | null = null;
  isSubmitting = false;

  showEditServiciosModal = false;
  reservaEditando: ReservaResponse | null = null;
  serviciosSeleccionados: number[] = [];
  isSubmittingServicios = false;

  totalFacturado = 0;
  totalPendiente = 0;
  totalPagado = 0;
  cantidadFacturas = 0;

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.cargarTodo();
  }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }

  cargarTodo(): void {
    this.cargarFacturas();
    this.cargarReservasSinFactura();
    this.cargarServicios();
  }

  cargarFacturas(): void {
    this.http.get<FacturaResponse[]>(`${this.apiUrl}/facturas`, { headers: this.getHeaders() }).subscribe({
      next: (data) => {
        this.facturas = data;
        this.aplicarFiltros();
        this.calcularKpis();
        this.cdr.detectChanges();
      },
      error: () => this.showToast('Error al cargar facturas', 'error')
    });
  }

  cargarReservasSinFactura(): void {
    this.http.get<ReservaResponse[]>(
      `${this.apiUrl}/reservas/finalizadas-sin-factura`,
      { headers: this.getHeaders() }
    ).subscribe({
      next: (data) => {
        this.reservasSinFactura = data;
        this.cdr.detectChanges();
      },
      error: () => console.error('Error al cargar reservas sin factura')
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

  aplicarFiltros(): void {
    let lista = [...this.facturas];
    if (this.filtroEstado) {
      lista = lista.filter(f => f.estadoPago === this.filtroEstado);
    }
    if (this.busqueda.trim()) {
      const q = this.busqueda.toLowerCase();
      lista = lista.filter(f =>
        f.nombreCliente?.toLowerCase().includes(q) ||
        f.nombreTerapeuta?.toLowerCase().includes(q) ||
        f.nombresServicios?.some(s => s.toLowerCase().includes(q)) ||
        String(f.idFactura).includes(q)
      );
    }
    this.facturasFiltradas = lista;
  }

  calcularKpis(): void {
    this.cantidadFacturas = this.facturas.length;
    this.totalFacturado = this.facturas.reduce((sum, f) => sum + (f.monto || 0), 0);
    this.totalPendiente = this.facturas
      .filter(f => f.estadoPago === 'pendiente')
      .reduce((sum, f) => sum + (f.monto || 0), 0);
    this.totalPagado = this.facturas
      .filter(f => f.estadoPago === 'pagado')
      .reduce((sum, f) => sum + (f.monto || 0), 0);
  }

  // ─── Generar factura ──────────────────────────────────────────

  abrirGenerarModal(): void {
    this.reservaSeleccionada = null;
    this.showGenerarModal = true;
    document.body.style.overflow = 'hidden';
  }

  cerrarGenerarModal(): void {
    this.showGenerarModal = false;
    this.reservaSeleccionada = null;
    this.isSubmitting = false;
    document.body.style.overflow = '';
  }

  seleccionarReserva(r: ReservaResponse): void {
    this.reservaSeleccionada = r;
  }

  generarFactura(): void {
    if (!this.reservaSeleccionada || this.isSubmitting) return;
    this.isSubmitting = true;

    this.http.post<FacturaResponse>(
      `${this.apiUrl}/facturas/reserva/${this.reservaSeleccionada.idReserva}`,
      {},
      { headers: this.getHeaders() }
    ).subscribe({
      next: () => {
        this.showToast('Factura generada exitosamente', 'success');
        this.cerrarGenerarModal();
        this.cargarTodo();
      },
      error: (err) => {
        const msg = err?.error?.message || 'Error al generar factura';
        this.showToast(msg, 'error');
        this.isSubmitting = false;
      }
    });
  }

  // ─── Editar servicios ─────────────────────────────────────────

  abrirEditServiciosDesdeFactura(factura: FacturaResponse, event: MouseEvent): void {
    event.stopPropagation();
    this.http.get<ReservaResponse>(
      `${this.apiUrl}/reservas/${factura.idReserva}`,
      { headers: this.getHeaders() }
    ).subscribe({
      next: (reserva) => {
        this.reservaEditando = reserva;
        this.serviciosSeleccionados = [...(reserva.idServicios || [])];
        this.showEditServiciosModal = true;
        document.body.style.overflow = 'hidden';
        this.cdr.detectChanges();
      },
      error: () => this.showToast('Error al cargar reserva', 'error')
    });
  }

  cerrarEditServicios(): void {
    this.showEditServiciosModal = false;
    this.reservaEditando = null;
    this.serviciosSeleccionados = [];
    this.isSubmittingServicios = false;
    document.body.style.overflow = '';
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

    this.http.patch<ReservaResponse>(
      `${this.apiUrl}/reservas/${this.reservaEditando.idReserva}/servicios`,
      this.serviciosSeleccionados,
      { headers: this.getHeaders() }
    ).subscribe({
      next: () => {
        this.showToast('Servicios actualizados correctamente', 'success');
        this.cerrarEditServicios();
        this.cargarTodo();
      },
      error: () => {
        this.showToast('Error al actualizar servicios', 'error');
        this.isSubmittingServicios = false;
      }
    });
  }

  // ─── Registrar pago ───────────────────────────────────────────

  registrarPago(factura: FacturaResponse, event?: MouseEvent): void {
    if (event) event.stopPropagation();
    this.http.patch<FacturaResponse>(
      `${this.apiUrl}/facturas/${factura.idFactura}/pagar`,
      {},
      { headers: this.getHeaders() }
    ).subscribe({
      next: () => {
        this.showToast('Pago registrado exitosamente', 'success');
        this.cargarFacturas();
        if (this.facturaDetalle?.idFactura === factura.idFactura) {
          this.facturaDetalle.estadoPago = 'pagado';
        }
      },
      error: () => this.showToast('Error al registrar pago', 'error')
    });
  }

  // ─── Anular factura ───────────────────────────────────────────

  anularFactura(factura: FacturaResponse, event: MouseEvent): void {
    event.stopPropagation();
    if (!confirm(`¿Anular la factura #${factura.idFactura}? Esta acción no se puede deshacer.`)) return;
    this.http.patch<FacturaResponse>(
      `${this.apiUrl}/facturas/${factura.idFactura}/anular`,
      {},
      { headers: this.getHeaders() }
    ).subscribe({
      next: () => {
        this.showToast('Factura anulada', 'info');
        this.cargarFacturas();
      },
      error: (err) => {
        const msg = err?.error?.message || 'Error al anular factura';
        this.showToast(msg, 'error');
      }
    });
  }

  // ─── Modal detalle ────────────────────────────────────────────

  abrirDetalle(factura: FacturaResponse): void {
    this.facturaDetalle = factura;
    this.showDetalleModal = true;
    document.body.style.overflow = 'hidden';
  }

  cerrarDetalle(): void {
    this.showDetalleModal = false;
    document.body.style.overflow = '';
  }

  // ─── Helpers ──────────────────────────────────────────────────

  getEstadoClass(estado: string): string {
    const classes: Record<string, string> = {
      'pendiente': 'estado--pendiente',
      'pagado': 'estado--pagado',
      'anulada': 'estado--anulada'
    };
    return classes[estado] || '';
  }

  getEstadoIcon(estado: string): string {
    const icons: Record<string, string> = {
      'pendiente': 'schedule',
      'pagado': 'check_circle',
      'anulada': 'cancel'
    };
    return icons[estado] || 'info';
  }

  showToast(message: string, type: 'success' | 'error' | 'info' = 'info'): void {
    const toast: Toast = { id: Math.random().toString(36).slice(2), message, type };
    this.toasts.push(toast);
    setTimeout(() => { this.toasts = this.toasts.filter(t => t.id !== toast.id); }, 3000);
  }
}