import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Navbar } from '../../../components/navbar/navbar';

interface Servicio {
  idServicio: number;
  nombre: string;
  descripcion: string;
  precio: number;
  duracionMinutos: number;
  estado: string;
  imagenUrl?: string;
}

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
  icon: string;
}

interface ServicioForm {
  nombre: string;
  descripcion: string;
  precio: number | null;
  duracionMinutos: number | null;
  imagenUrl: string;
}

@Component({
  selector: 'app-serviciosadmi',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, Navbar],
  templateUrl: './Serviciosadmi.html',
  styleUrls: ['./Serviciosadmi.css'],
})
export class Serviciosadmi implements OnInit {

  private apiUrl = 'http://localhost:8080/servicios';
  readonly placeholder = 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=600&q=80';

  services: Servicio[] = [];
  currentPage = 0;
  readonly itemsPerPage = 6;
  isSubmitting = false;
  busqueda: string = '';
  mostrarInactivos: boolean = false;

  showServiceModal = false;
  showConfirmModal = false;
  isEditing = false;
  editingId: number | null = null;
  deletingId: number | null = null;
  deletingName = '';

  form: ServicioForm = this.emptyForm();
  toasts: Toast[] = [];

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.cargarServicios();
  }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }

  cargarServicios(): void {
    this.http.get<Servicio[]>(this.apiUrl, { headers: this.getHeaders() }).subscribe({
      next: (data) => {
        this.services = [...data];
        this.cdr.detectChanges();
      },
      error: () => this.showToast('Error al cargar servicios', 'error')
    });
  }

  get serviciosFiltrados(): Servicio[] {
    let lista = this.mostrarInactivos
      ? this.services.filter(s => s.estado === 'inactivo')
      : this.services.filter(s => s.estado === 'activo');
    if (!this.busqueda.trim()) return lista;
    const q = this.busqueda.toLowerCase();
    return lista.filter(s =>
      s.nombre.toLowerCase().includes(q) ||
      (s.descripcion?.toLowerCase().includes(q) ?? false)
    );
  }

  get pageItems(): Servicio[] {
    const start = this.currentPage * this.itemsPerPage;
    return this.serviciosFiltrados.slice(start, start + this.itemsPerPage);
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.serviciosFiltrados.length / this.itemsPerPage));
  }

  get totalCount(): number { return this.serviciosFiltrados.length; }
  get showingCount(): number { return this.pageItems.length; }
  get pageArray(): number[] { return Array.from({ length: this.totalPages }, (_, i) => i); }

  goToPage(page: number): void { this.currentPage = page; }
  prevPage(): void { if (this.currentPage > 0) this.currentPage--; }
  nextPage(): void { if (this.currentPage < this.totalPages - 1) this.currentPage++; }

  openAddModal(): void {
    this.isEditing = false;
    this.editingId = null;
    this.form = this.emptyForm();
    this.isSubmitting = false;
    this.showServiceModal = true;
    document.body.style.overflow = 'hidden';
  }

  openEditModal(svc: Servicio): void {
    this.isEditing = true;
    this.editingId = svc.idServicio;
    this.isSubmitting = false;
    this.form = {
      nombre: svc.nombre,
      descripcion: svc.descripcion,
      precio: svc.precio,
      duracionMinutos: svc.duracionMinutos,
      imagenUrl: svc.imagenUrl || ''
    };
    this.showServiceModal = true;
    document.body.style.overflow = 'hidden';
  }

  closeServiceModal(): void {
    this.showServiceModal = false;
    this.isSubmitting = false;
    document.body.style.overflow = '';
  }

  submitForm(): void {
    if (this.isSubmitting) return;
    this.isSubmitting = true;

    if (!this.form.nombre || !this.form.precio || !this.form.duracionMinutos) {
      this.showToast('Complete los campos requeridos', 'error');
      this.isSubmitting = false;
      return;
    }

    const body = {
      nombre: this.form.nombre.trim(),
      descripcion: this.form.descripcion.trim(),
      precio: this.form.precio,
      duracionMinutos: this.form.duracionMinutos,
      imagenUrl: this.form.imagenUrl
    };

    if (this.isEditing && this.editingId) {
      this.http.put<Servicio>(`${this.apiUrl}/${this.editingId}`, body, { headers: this.getHeaders() }).subscribe({
        next: () => {
          this.showToast('Servicio actualizado correctamente', 'success');
          this.closeServiceModal();
          this.cargarServicios();
        },
        error: () => {
          this.showToast('Error al actualizar servicio', 'error');
          this.isSubmitting = false;
        }
      });
    } else {
      this.http.post<Servicio>(this.apiUrl, body, { headers: this.getHeaders() }).subscribe({
        next: () => {
          this.showToast('Servicio creado exitosamente', 'success');
          this.closeServiceModal();
          this.cargarServicios();
        },
        error: () => {
          this.showToast('Error al crear servicio', 'error');
          this.isSubmitting = false;
        }
      });
    }
  }

  // Abre confirmación solo si está activo, activa directo si está inactivo
  accionEstado(svc: Servicio): void {
    if (svc.estado === 'activo') {
      this.deletingId = svc.idServicio;
      this.deletingName = svc.nombre;
      this.showConfirmModal = true;
      document.body.style.overflow = 'hidden';
    } else {
      this.activar(svc.idServicio);
    }
  }

  activar(id: number): void {
    this.http.patch(
      `${this.apiUrl}/${id}/estado?estado=activo`,
      {},
      { headers: this.getHeaders() }
    ).subscribe({
      next: () => {
        this.showToast('Servicio activado', 'success');
        this.cargarServicios();
      },
      error: () => this.showToast('Error al activar servicio', 'error')
    });
  }

  closeConfirmModal(): void {
    this.showConfirmModal = false;
    document.body.style.overflow = '';
  }

  confirmDesactivar(): void {
    if (!this.deletingId) return;
    this.http.patch(
      `${this.apiUrl}/${this.deletingId}/estado?estado=inactivo`,
      {},
      { headers: this.getHeaders() }
    ).subscribe({
      next: () => {
        this.showToast(`"${this.deletingName}" desactivado`, 'info');
        this.deletingId = null;
        this.closeConfirmModal();
        this.cargarServicios();
      },
      error: () => this.showToast('Error al desactivar servicio', 'error')
    });
  }

  onImgError(event: Event): void {
    (event.target as HTMLImageElement).src = this.placeholder;
  }

  showToast(message: string, type: 'success' | 'error' | 'info' = 'info'): void {
    const icons = { success: 'check_circle', error: 'error', info: 'info' };
    const toast: Toast = { id: Math.random().toString(36).slice(2), message, type, icon: icons[type] };
    this.toasts.push(toast);
    setTimeout(() => { this.toasts = this.toasts.filter(t => t.id !== toast.id); }, 3000);
  }

  trackToast(_: number, t: Toast): string { return t.id; }
  trackService(_: number, s: Servicio): string { return s.idServicio.toString(); }

  private emptyForm(): ServicioForm {
    return { nombre: '', descripcion: '', precio: null, duracionMinutos: null, imagenUrl: '' };
  }
}