import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AlertComponent } from '../../components/alert/alert';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterLink, AlertComponent],
  templateUrl: './register.html',
  styleUrls: ['./register.css']
})
export class RegisterComponent {

  nombre: string = '';
  correo: string = '';
  password: string = '';
  confirmPassword: string = '';
  isLoading: boolean = false;
  errorMessage: string = '';

  private apiUrl = `${environment.apiUrl}/auth/register`;

  constructor(private http: HttpClient, private router: Router) {}

  register() {
    this.errorMessage = '';

    if (!this.nombre || !this.correo || !this.password || !this.confirmPassword) {
      this.errorMessage = 'Por favor completa todos los campos.';
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.errorMessage = 'Las contraseñas no coinciden.';
      return;
    }

    if (this.password.length < 6) {
      this.errorMessage = 'La contraseña debe tener mínimo 6 caracteres.';
      return;
    }

    this.isLoading = true;

    this.http.post<any>(this.apiUrl, {
      nombre: this.nombre,
      correo: this.correo,
      password: this.password
    }).subscribe({
      next: (response) => {
        localStorage.setItem('token', response.token);
        localStorage.setItem('rol', response.rol);
        localStorage.setItem('nombre', response.nombre);
        localStorage.setItem('idUsuario', response.idUsuario);
        this.isLoading = false;
        this.router.navigate(['/dashboard/cliente']);
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = this.parsearError(err);
      }
    });
  }

  private parsearError(err: any): string {
    if (!err.error) return 'Error al crear la cuenta.';
    if (typeof err.error === 'string') return err.error;
    if (err.error.error) return err.error.error;
    const mensajes = Object.values(err.error) as string[];
    if (mensajes.length > 0) return mensajes.join(' ');
    return 'Error al crear la cuenta.';
  }

  irAlLogin() {
    this.router.navigate(['/login']);
  }
}