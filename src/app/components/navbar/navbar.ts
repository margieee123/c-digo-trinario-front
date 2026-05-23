import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar implements OnInit {

  @Input() paginaActiva: string = 'inicio';
  nombre: string = '';
  rol: string = '';

  // Links por rol
  esAdmin = false;
  esRecepcionista = false;
  esTerapeuta = false;
  esCliente = false;

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.nombre = localStorage.getItem('nombre') || 'Usuario';
    this.rol = localStorage.getItem('rol') || '';
    this.esAdmin = this.rol === 'administrador';
    this.esRecepcionista = this.rol === 'recepcionista';
    this.esTerapeuta = this.rol === 'terapeuta';
    this.esCliente = this.rol === 'cliente';
  }

  cerrarSesion(): void {
    localStorage.clear();
    this.router.navigate(['/login']);
  }

  getDashboardHome(): string {
    switch (this.rol) {
      case 'administrador': return '/dashboard/admin';
      case 'recepcionista': return '/dashboard/recepcionista';
      case 'terapeuta': return '/dashboard/terapeuta';
      case 'cliente': return '/dashboard/cliente';
      default: return '/login';
    }
  }
}