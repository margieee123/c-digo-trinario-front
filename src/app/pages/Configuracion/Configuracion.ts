import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Navbar } from '../../components/navbar/navbar';
import { environment } from 'environments/environment';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface Tema {
  id: string;
  nombre: string;
  descripcion: string;
  bg: string;
  surface: string;
  gold: string;
  text: string;
}

@Component({
  selector: 'app-configuracion',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, Navbar],
  templateUrl: './Configuracion.html',
  styleUrls: ['./Configuracion.css']
})
export class ConfiguracionComponent implements OnInit {

  private apiUrl = environment.apiUrl;
  toasts: Toast[] = [];

  // Perfil
  nombre: string = '';
  correo: string = '';
  rol: string = '';

  // Info del spa (localStorage)
  infoSpa = {
    nombre: 'Spa Manager',
    direccion: '',
    telefono: '',
    email: ''
  };

  // Cambiar contraseña
  passwordForm = {
    actual: '',
    nueva: '',
    confirmar: ''
  };
  isSubmittingPassword = false;
  showActual = false;
  showNueva = false;
  showConfirmar = false;

  // Recuperar contraseña
  correoRecuperar: string = '';
  isSubmittingRecuperar = false;

  // Temas
  temaActual: string = 'obsidiana';
  temas: Tema[] = [
    {
      id: 'obsidiana',
      nombre: 'Obsidiana',
      descripcion: 'Elegancia nocturna',
      bg: '#131313',
      surface: '#1c1b1b',
      gold: '#e3c190',
      text: '#e5e2e1'
    },
    {
      id: 'bambu',
      nombre: 'Bambú',
      descripcion: 'Naturaleza zen',
      bg: '#1a1f1a',
      surface: '#1f261f',
      gold: '#8fad88',
      text: '#e0e8e0'
    },
    {
      id: 'lavanda',
      nombre: 'Lavanda',
      descripcion: 'Relajación y bienestar',
      bg: '#16151f',
      surface: '#1c1b2a',
      gold: '#c4a8d4',
      text: '#e8e4f0'
    },
    {
      id: 'ambar',
      nombre: 'Ámbar',
      descripcion: 'Calidez termal',
      bg: '#1a1410',
      surface: '#221a14',
      gold: '#e8a87c',
      text: '#f0e8e0'
    },
    {
      id: 'perla',
      nombre: 'Perla',
      descripcion: 'Minimalismo puro',
      bg: '#1e1e1e',
      surface: '#262626',
      gold: '#e8e4dc',
      text: '#f5f5f5'
    }
  ];

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.nombre = localStorage.getItem('nombre') || '';
    this.correo = localStorage.getItem('correo') || '';
    this.rol = localStorage.getItem('rol') || '';
    const claveTema = `tema_${this.correo}`;
    this.temaActual = localStorage.getItem(claveTema) || 'obsidiana';
    this.cargarInfoSpa();
    this.aplicarTema(this.temaActual);
  }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }

  // ─── Info Spa ─────────────────────────────────────────────────

  cargarInfoSpa(): void {
    this.http.get<any>(`${this.apiUrl}/configuracion-spa`,
      { headers: this.getHeaders() }
    ).subscribe({
      next: (data) => {
        this.infoSpa = data;
        this.cdr.detectChanges();
      },
      error: () => {
        const saved = localStorage.getItem('infoSpa');
        if (saved) this.infoSpa = JSON.parse(saved);
      }
    });
  }

  guardarInfoSpa(): void {
    this.http.put(
      `${this.apiUrl}/configuracion-spa`,
      this.infoSpa,
      { headers: this.getHeaders() }
    ).subscribe({
      next: () => {
        localStorage.setItem('infoSpa', JSON.stringify(this.infoSpa));
        this.showToast('Información del spa guardada', 'success');
      },
      error: () => this.showToast('Error al guardar información', 'error')
    });
  }

  // ─── Cambiar contraseña ───────────────────────────────────────

  cambiarPassword(): void {
    if (this.isSubmittingPassword) return;

    if (!this.passwordForm.actual || !this.passwordForm.nueva || !this.passwordForm.confirmar) {
      this.showToast('Completa todos los campos', 'error');
      return;
    }

    if (this.passwordForm.nueva !== this.passwordForm.confirmar) {
      this.showToast('Las contraseñas no coinciden', 'error');
      return;
    }

    if (this.passwordForm.nueva.length < 6) {
      this.showToast('La contraseña debe tener al menos 6 caracteres', 'error');
      return;
    }

    this.isSubmittingPassword = true;

    this.http.patch(
      `${this.apiUrl}/usuarios/cambiar-password`,
      {
        passwordActual: this.passwordForm.actual,
        passwordNueva: this.passwordForm.nueva
      },
      { headers: this.getHeaders() }
    ).subscribe({
      next: () => {
        this.showToast('Contraseña cambiada exitosamente', 'success');
        this.passwordForm = { actual: '', nueva: '', confirmar: '' };
        this.isSubmittingPassword = false;
      },
      error: (err) => {
        const msg = err?.error?.message || 'Error al cambiar contraseña';
        this.showToast(msg, 'error');
        this.isSubmittingPassword = false;
      }
    });
  }

  // ─── Recuperar contraseña ─────────────────────────────────────

  recuperarPassword(): void {
    if (!this.correoRecuperar || this.isSubmittingRecuperar) return;
    this.isSubmittingRecuperar = true;

    this.http.post(
      `${this.apiUrl}/usuarios/recuperar-password`,
      { correo: this.correoRecuperar }
    ).subscribe({
      next: () => {
        this.showToast('Se envió una contraseña temporal al correo', 'success');
        this.correoRecuperar = '';
        this.isSubmittingRecuperar = false;
      },
      error: (err) => {
        const msg = err?.error?.message || 'Error al recuperar contraseña';
        this.showToast(msg, 'error');
        this.isSubmittingRecuperar = false;
      }
    });
  }

  // ─── Temas ────────────────────────────────────────────────────

  seleccionarTema(id: string): void {
    this.temaActual = id;
    const claveTema = `tema_${this.correo}`;
    localStorage.setItem(claveTema, id);
    this.aplicarTema(id);
    this.showToast('Tema aplicado', 'success');
  }

  aplicarTema(id: string): void {
    document.body.className = document.body.className
      .split(' ')
      .filter(c => !c.startsWith('tema-'))
      .join(' ');
    if (id !== 'obsidiana') {
      document.body.classList.add(`tema-${id}`);
    }
    const claveTema = `tema_${this.correo}`;
    localStorage.setItem(claveTema, id);
  }

  // ─── Toasts ───────────────────────────────────────────────────

  showToast(message: string, type: 'success' | 'error' | 'info' = 'info'): void {
    const toast: Toast = { id: Math.random().toString(36).slice(2), message, type };
    this.toasts.push(toast);
    setTimeout(() => { this.toasts = this.toasts.filter(t => t.id !== toast.id); }, 3000);
  }
}