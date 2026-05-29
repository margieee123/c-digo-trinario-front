import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AlertComponent } from '../../../components/alert/alert';
import { environment } from 'environments/environment';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, AlertComponent],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {

  correo: string = '';
  password: string = '';
  isLoading: boolean = false;
  errorMessage: string = '';
  mostrarPassword: boolean = false;

  // Recuperar contraseña
  mostrarRecuperar: boolean = false;
  correoRecuperar: string = '';
  enviandoRecuperar: boolean = false;
  mensajeRecuperar: string = '';
  errorRecuperar: string = '';

  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient, private router: Router) {}

  onLogin() {
    console.log('onLogin ejecutado');
    this.errorMessage = '';

    if (!this.correo || !this.password) {
      this.errorMessage = 'Por favor completa todos los campos.';
      return;
    }

    this.isLoading = true;

    this.http.post<any>(`${this.apiUrl}/auth/login`, {
      correo: this.correo,
      password: this.password
    }).subscribe({
      next: (response) => {
        localStorage.setItem('token', response.token);
        localStorage.setItem('rol', response.rol);
        localStorage.setItem('nombre', response.nombre);
        localStorage.setItem('idUsuario', response.idUsuario);
        localStorage.setItem('correo', this.correo);

        const claveTema = `tema_${this.correo}`;
        const tema = localStorage.getItem(claveTema) || 'obsidiana';
        document.body.className = document.body.className
          .split(' ')
          .filter(c => !c.startsWith('tema-'))
          .join(' ');
        if (tema !== 'obsidiana') {
          document.body.classList.add(`tema-${tema}`);
        }

        this.isLoading = false;
        this.redirigirSegunRol(response.rol);
      },
      error: (err) => {
        this.isLoading = false;
        console.log('err completo:', err);
        console.log('err.error:', err.error);
        this.errorMessage = this.parsearError(err);
        console.log('errorMessage:', this.errorMessage);
      }
    });
  }

  abrirRecuperar(): void {
    this.mostrarRecuperar = true;
    this.correoRecuperar = this.correo;
    this.mensajeRecuperar = '';
    this.errorRecuperar = '';
  }

  cerrarRecuperar(): void {
    this.mostrarRecuperar = false;
    this.correoRecuperar = '';
    this.mensajeRecuperar = '';
    this.errorRecuperar = '';
  }

  enviarRecuperar(): void {
    if (!this.correoRecuperar || this.enviandoRecuperar) return;
    this.enviandoRecuperar = true;
    this.mensajeRecuperar = '';
    this.errorRecuperar = '';

    this.http.post(`${this.apiUrl}/usuarios/recuperar-password`,
      { correo: this.correoRecuperar }
    ).subscribe({
      next: () => {
        this.mensajeRecuperar = 'Se envió una contraseña temporal a tu correo.';
        this.enviandoRecuperar = false;
        setTimeout(() => this.cerrarRecuperar(), 3000);
      },
      error: (err) => {
        this.errorRecuperar = err?.error?.message || 'Correo no encontrado en el sistema.';
        this.enviandoRecuperar = false;
      }
    });
  }

  private parsearError(err: any): string {
    if (!err.error) return 'Error al iniciar sesión.';
    if (typeof err.error === 'string') return err.error;
    if (err.error.error) return err.error.error;
    const mensajes = Object.values(err.error) as string[];
    if (mensajes.length > 0) return mensajes.join(' ');
    return 'Error al iniciar sesión.';
  }

  private redirigirSegunRol(rol: string) {
    switch (rol) {
      case 'administrador':
        this.router.navigate(['/dashboard/admin']);
        break;
      case 'terapeuta':
        this.router.navigate(['/dashboard/terapeuta']);
        break;
      case 'recepcionista':
        this.router.navigate(['/dashboard/recepcionista']);
        break;
      case 'cliente':
        this.router.navigate(['/dashboard/cliente']);
        break;
      default:
        this.router.navigate(['/login']);
    }
  }
}