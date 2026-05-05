import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';

interface Servicio {
  idServicio: number;
  nombre: string;
  descripcion: string;
  precio: number;
  duracionMinutos: number;
  estado: string;
  imageUrl?: string;
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
  imageUrl: string;
}

@Component({
  selector: 'app-serviciosadmi',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './Serviciosadmi.html',
  styleUrls: ['./Serviciosadmi.css'],
})
export class Serviciosadmi implements OnInit {

  private apiUrl = 'http://localhost:8080/servicios';
  readonly placeholder = 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=600&q=80';

  services: Servicio[] = [];
  currentPage = 0;
  readonly itemsPerPage = 6;

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
  const token = localStorage.getItem('token');
  console.log('token al cargar:', token);
  this.http.get<Servicio[]>(this.apiUrl, { headers: this.getHeaders() }).subscribe({
    next: (data) => {
      console.log('servicios cargados:', data);
      this.services = [...data];
      this.cdr.detectChanges();
    },
    error: (err) => {
      console.error('error al cargar:', err);
      this.showToast('Error al cargar servicios', 'error');
    }
  });
}

 get pageItems(): Servicio[] {
  console.log('pageItems - services.length:', this.services.length, 'currentPage:', this.currentPage);
  const start = this.currentPage * this.itemsPerPage;
  return this.services.slice(start, start + this.itemsPerPage);
}

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.services.length / this.itemsPerPage));
  }

  get totalCount(): number { return this.services.length; }
  get showingCount(): number { return this.pageItems.length; }
  get pageArray(): number[] { return Array.from({ length: this.totalPages }, (_, i) => i); }

  goToPage(page: number): void { this.currentPage = page; }
  prevPage(): void { if (this.currentPage > 0) this.currentPage--; }
  nextPage(): void { if (this.currentPage < this.totalPages - 1) this.currentPage++; }

  openAddModal(): void {
    this.isEditing = false;
    this.editingId = null;
    this.form = this.emptyForm();
    this.showServiceModal = true;
    document.body.style.overflow = 'hidden';
  }

  openEditModal(svc: Servicio): void {
    this.isEditing = true;
    this.editingId = svc.idServicio;
    this.form = {
      nombre: svc.nombre,
      descripcion: svc.descripcion,
      precio: svc.precio,
      duracionMinutos: svc.duracionMinutos,
      imageUrl: svc.imageUrl || ''
    };
    this.showServiceModal = true;
    document.body.style.overflow = 'hidden';
  }

  closeServiceModal(): void {
    this.showServiceModal = false;
    document.body.style.overflow = '';
  }

 submitForm(): void {
  console.log('submitForm ejecutado', this.form);
  if (!this.form.nombre || !this.form.precio || !this.form.duracionMinutos) {
    this.showToast('Complete los campos requeridos', 'error');
    return;
  }

    const body = {
      nombre: this.form.nombre.trim(),
      descripcion: this.form.descripcion.trim(),
      precio: this.form.precio,
      duracionMinutos: this.form.duracionMinutos
    };

    if (this.isEditing && this.editingId) {
      this.http.put<Servicio>(`${this.apiUrl}/${this.editingId}`, body, { headers: this.getHeaders() }).subscribe({
        next: (updated) => {
          updated.imageUrl = this.form.imageUrl;
          const idx = this.services.findIndex(s => s.idServicio === this.editingId);
          if (idx !== -1) this.services[idx] = updated;
          this.services = [...this.services];
          this.showToast('Servicio actualizado correctamente', 'success');
          this.closeServiceModal();
        },
        error: () => this.showToast('Error al actualizar servicio', 'error')
      });
    } else {
      this.http.post<Servicio>(this.apiUrl, body, { headers: this.getHeaders() }).subscribe({
        next: (created) => {
          created.imageUrl = this.form.imageUrl;
          this.services = [created, ...this.services];
          this.currentPage = 0;
          this.showToast('Servicio creado exitosamente', 'success');
          this.closeServiceModal();
        },
        error: () => this.showToast('Error al crear servicio', 'error')
      });
    }
  }

  openConfirmDelete(svc: Servicio): void {
    this.deletingId = svc.idServicio;
    this.deletingName = svc.nombre;
    this.showConfirmModal = true;
    document.body.style.overflow = 'hidden';
  }

  closeConfirmModal(): void {
    this.showConfirmModal = false;
    document.body.style.overflow = '';
  }

  confirmDelete(): void {
    if (!this.deletingId) return;
    this.http.delete(`${this.apiUrl}/${this.deletingId}`, { headers: this.getHeaders() }).subscribe({
      next: () => {
        this.services = this.services.filter(s => s.idServicio !== this.deletingId);
        if (this.currentPage >= this.totalPages) {
          this.currentPage = Math.max(0, this.totalPages - 1);
        }
        this.showToast(`"${this.deletingName}" eliminado`, 'error');
        this.deletingId = null;
        this.closeConfirmModal();
      },
      error: () => this.showToast('Error al eliminar servicio', 'error')
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
    return { nombre: '', descripcion: '', precio: null, duracionMinutos: null, imageUrl: '' };
  }
}