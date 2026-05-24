import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { Navbar } from '../../../components/navbar/navbar';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'environments/environment';

interface Usuario {
  id: number;
  nombre: string;
  correo: string;
  rol: string;
  estado: string;
}

interface UserForm {
  nombre: string;
  correo: string;
  password: string;
  rol: string;
}

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
  icon: string;
}

@Component({
  selector: 'app-usuariosadmi',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, Navbar],
  templateUrl: './Usuariosadmi.html',
  styleUrls: ['./Usuariosadmi.css']
})
export class Usuariosadmi implements OnInit {

  private apiUrl = environment.apiUrl + '/usuarios';
  nombre: string = '';
  tabActivo: string = 'clientes';
  busqueda: string = '';
  mostrarInactivos: boolean = false;

  clientes: Usuario[] = [];
  especialistas: Usuario[] = [];
  toasts: Toast[] = [];

  showUserModal = false;
  showConfirmModal = false;
  isEditing = false;
  editingId: number | null = null;
  deletingId: number | null = null;
  deletingNombre = '';
  deletingTipo: 'cliente' | 'especialista' = 'cliente';

  form: UserForm = this.emptyForm('cliente');

  readonly rolOpciones = [
    { value: 'cliente', label: 'Cliente' },
    { value: 'terapeuta', label: 'Terapeuta' },
    { value: 'recepcionista', label: 'Recepcionista' },
    { value: 'administrador', label: 'Administrador' }
  ];

  constructor(
    private http: HttpClient,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.nombre = localStorage.getItem('nombre') || 'Administrador';
    this.cargarUsuarios();
  }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }

  cargarUsuarios(): void {
    this.http.get<Usuario[]>(this.apiUrl, { headers: this.getHeaders() }).subscribe({
      next: (data) => {
        this.clientes = data.filter(u => u.rol === 'cliente');
        this.especialistas = data.filter(u => u.rol !== 'cliente' && u.rol !== 'administrador');
        this.cdr.detectChanges();
      },
      error: () => this.showToast('Error al cargar usuarios', 'error')
    });
  }

  get clientesFiltrados(): Usuario[] {
  let lista = this.mostrarInactivos
    ? this.clientes.filter(u => u.estado === 'inactivo')
    : this.clientes.filter(u => u.estado === 'activo');
  if (!this.busqueda.trim()) return lista;
  const q = this.busqueda.toLowerCase();
  return lista.filter(c =>
    c.nombre.toLowerCase().includes(q) ||
    c.correo.toLowerCase().includes(q) ||
    c.id.toString().includes(q)
  );
}

get especialistasFiltrados(): Usuario[] {
  let lista = this.mostrarInactivos
    ? this.especialistas.filter(u => u.estado === 'inactivo')
    : this.especialistas.filter(u => u.estado === 'activo');
  if (!this.busqueda.trim()) return lista;
  const q = this.busqueda.toLowerCase();
  return lista.filter(e =>
    e.nombre.toLowerCase().includes(q) ||
    e.correo.toLowerCase().includes(q) ||
    e.id.toString().includes(q)
  );
}

  cerrarSesion(): void {
    localStorage.clear();
    this.router.navigate(['/login']);
  }

  openAddCliente(): void {
    this.isEditing = false;
    this.editingId = null;
    this.form = this.emptyForm('cliente');
    this.showUserModal = true;
    document.body.style.overflow = 'hidden';
  }

  openAddEspecialista(): void {
    this.isEditing = false;
    this.editingId = null;
    this.form = this.emptyForm('terapeuta');
    this.showUserModal = true;
    document.body.style.overflow = 'hidden';
  }

  openEditCliente(u: Usuario): void {
    this.isEditing = true;
    this.editingId = u.id;
    this.form = { nombre: u.nombre, correo: u.correo, password: '', rol: u.rol };
    this.showUserModal = true;
    document.body.style.overflow = 'hidden';
  }

  openEditEspecialista(u: Usuario): void {
    this.isEditing = true;
    this.editingId = u.id;
    this.form = { nombre: u.nombre, correo: u.correo, password: '', rol: u.rol };
    this.showUserModal = true;
    document.body.style.overflow = 'hidden';
  }

  closeUserModal(): void {
    this.showUserModal = false;
    document.body.style.overflow = '';
  }

  submitForm(): void {
    if (!this.form.nombre || !this.form.correo || !this.form.rol) {
      this.showToast('Complete los campos requeridos', 'error');
      return;
    }

    const body: any = {
      nombre: this.form.nombre.trim(),
      correo: this.form.correo.trim(),
      rol: this.form.rol
    };

    if (this.isEditing && this.editingId !== null) {
      if (this.form.password) body.password = this.form.password;
      this.http.put<Usuario>(`${this.apiUrl}/${this.editingId}`, body, { headers: this.getHeaders() }).subscribe({
        next: () => {
          this.showToast('Usuario actualizado correctamente', 'success');
          this.cargarUsuarios();
          this.closeUserModal();
        },
        error: () => this.showToast('Error al actualizar usuario', 'error')
      });
    } else {
      if (!this.form.password) {
        this.showToast('La contraseña es obligatoria al crear un usuario', 'error');
        return;
      }
      body.password = this.form.password;
      this.http.post<Usuario>(this.apiUrl, body, { headers: this.getHeaders() }).subscribe({
        next: () => {
          this.showToast('Usuario creado exitosamente', 'success');
          this.cargarUsuarios();
          this.closeUserModal();
        },
        error: () => this.showToast('Error al crear usuario', 'error')
      });
    }
  }

  cambiarEstado(u: Usuario): void {
    const nuevoEstado = u.estado === 'activo' ? 'inactivo' : 'activo';
    this.http.put<Usuario>(`${this.apiUrl}/${u.id}/estado?estado=${nuevoEstado}`, {}, { headers: this.getHeaders() }).subscribe({
      next: () => {
        this.showToast(`Estado cambiado a ${nuevoEstado}`, 'success');
        this.cargarUsuarios();
      },
      error: () => this.showToast('Error al cambiar estado', 'error')
    });
  }

  showToast(message: string, type: 'success' | 'error' | 'info' = 'info'): void {
    const icons = { success: 'check_circle', error: 'error', info: 'info' };
    const t: Toast = { id: Math.random().toString(36).slice(2), message, type, icon: icons[type] };
    this.toasts.push(t);
    setTimeout(() => { this.toasts = this.toasts.filter(x => x.id !== t.id); }, 3000);
  }

  trackToast(_: number, t: Toast): string { return t.id; }

  private emptyForm(rol: string): UserForm {
    return { nombre: '', correo: '', password: '', rol };
  }
}