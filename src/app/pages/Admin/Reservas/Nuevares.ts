// reservas.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

// ─── Interfaces ───────────────────────────────────────────────────────────────

export interface Servicio {
  id: number;
  nombre: string;
  precio: number;
  duracion: number;       // minutos
  categoria: string;
  descripcion: string;
  imagen: string;
  tags: string[];         // para búsqueda extendida
}

export interface Complemento {
  id: number;
  nombre: string;
  precio: number;
  agregado: boolean;
}

export interface Cliente {
  nombre: string;
  email: string;
  telefono: string;
}

export interface FechaOpcion {
  etiqueta: string;
  dia: string;
  valor: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

@Component({
  selector: 'app-reservas',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './Nuevares.html',
  styleUrls: ['./Nuevares.css'],
})
export class ReservasComponent implements OnInit {

  // ── Estado de búsqueda
  searchQuery: string = '';
  serviciosFiltrados: Servicio[] = [];

  // ── Servicio elegido
  servicioSeleccionado: Servicio | null = null;

  // ── Datos del cliente
  cliente: Cliente = {
    nombre: 'Ana García',
    email: 'ana.garcia@email.com',
    telefono: '+34 600 000 000',
  };

  // ── Fecha / hora
  fechaSeleccionada: string = 'hoy';
  horaSeleccionada: string = '16:00';

  fechas: FechaOpcion[] = [
    { etiqueta: 'Hoy',    dia: '24 Oct', valor: 'hoy'    },
    { etiqueta: 'Mañana', dia: '25 Oct', valor: 'manana' },
  ];

  horas: string[] = ['16:00', '17:30', '19:00'];

  // ── Complementos
  complementos: Complemento[] = [
    { id: 1, nombre: 'Exfoliación de manos', precio: 20,  agregado: false },
    { id: 2, nombre: 'Mascarilla capilar',   precio: 35,  agregado: false },
    { id: 3, nombre: 'Aromaterapia extra',   precio: 25,  agregado: false },
  ];

  // ── Catálogo de servicios
  // Reemplaza las URLs de imagen con las de tu proyecto (assets o CDN)
  servicios: Servicio[] = [
    {
      id: 1,
      nombre: 'Masaje de Piedras Volcánicas',
      precio: 120,
      duracion: 90,
      categoria: 'Relax Profundo',
      descripcion: 'Una terapia milenaria que utiliza piedras de basalto calientes para relajar la musculatura y equilibrar los centros energéticos.',
      imagen: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBXaTRuVYvYtweZpr6FKDcjRljf_nzS-KuXPtYjXxUh92Og5qaPP_hycZZE-jXKTUeqdrZuTNc8vd3DjCKMDl4-_AZAN6Xl4j6qmzgU53JAGss-FtITUnQisqZkPNkyI58i-PLwawd0BhTEEkWFtTFYLxw4p2WoCqVlWgu0rLTt0mkfy7Hchji7MwoGYXZpvdKYCePeX54mKZ9i2ngipq6peLbH4ZQSao1kluk4yvYpKV_XR2xXNtK4U_pF3IEHwtiPW7cJmSKINbU',
      tags: ['masaje', 'piedras', 'basalto', 'volcánico', 'calor', 'relax', 'muscular'],
    },
    {
      id: 2,
      nombre: 'Aromaterapia Sensorial',
      precio: 95,
      duracion: 60,
      categoria: 'Equilibrio Mental',
      descripcion: 'Inmersión olfativa con aceites orgánicos personalizados diseñados para restaurar la calma mental y la vitalidad corporal.',
      imagen: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBo1qZuOcfOEZFofbMZkFXWY2uqsEErCgUVEXguvp7CiS8_0PcfeA6xrKHIjJArKk0HmnyU1XgiyJmLHgtXqelzJCAIhyxwZrEYOp7xlnkDEF6qLGNtcLfH0G5wasQo5zPU5ZInrbj5lO8pi3x0lR5QhfjwFSevAI7R7zyLHBdfsiae6UysLI-q0m0FztArA-4QMSPo-VQshYa4UgnNFTxvxlbCuwcw0voRQWePIeGvtW0t9h1wabrKQwHZArcwEJeInnhQ8Pbsi8E',
      tags: ['aromaterapia', 'aceites', 'orgánico', 'aroma', 'olfativo', 'calma', 'mental'],
    },
    {
      id: 3,
      nombre: 'Facial de Oro 24K',
      precio: 185,
      duracion: 75,
      categoria: 'Iluminación Real',
      descripcion: 'Tratamiento rejuvenecedor de lujo que utiliza partículas de oro puro para estimular el colágeno y proporcionar un brillo inigualable.',
      imagen: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBDpaR7iDjZVYjTX5-U1M2pYwCAUzvqMZsK2_HvNz6wb4NpIk_TDflicwj8flJExnIC84lHCECE99zMjCwkV3pmHz9pbRQ5zjJICjdxri_cef2SdKswn9NrlbhdQnB1JxveGtM3Nq6MNlmK3l8xTe37Ug95JvodejnkuHcFTa_Te97NzswCvETJchFSkFv874cwPBUhuGmqs6iN2C9_AMYQfx6A83xayUa3NTR-66Q6hk61xmeaRj3ifUVitxFyBvenU9uyq4MlD54',
      tags: ['facial', 'oro', '24k', 'colágeno', 'brillo', 'lujo', 'piel', 'rejuvenecedor'],
    },
    {
      id: 4,
      nombre: 'Ritual de Hammam',
      precio: 140,
      duracion: 120,
      categoria: 'Purificación Artística',
      descripcion: 'Exfoliación profunda con jabón negro y guante kessa, seguida de un baño de vapor y envoltura de arcilla nutritiva.',
      imagen: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDNtPMB1wh0E8NggNpqDEdMPbytuUPrsxul3mpUMLIrGjS2A0xAReQYg5be_OY3HMKXJ7Dnne71sVNclY2bq-kkv1geKWdIVVS9K03labheJIUB17zT_ZbzUaeS2zbidIx6cYKgH7XhbcmBtjB0xg7TCWpUXmYR_jHuZajqVJ_sqLg4hL6WUt2nMQJemhwmDpvG0dHMNMPLSYJsfyIzZPv7q4xk9pHG0As062a-8wOmQBvdlqkkt7RKgqrrDN8miSI3oJl7z8CCZ5U',
      tags: ['hammam', 'ritual', 'marruecos', 'exfoliación', 'vapor', 'arcilla', 'jabón', 'kessa', 'purificación'],
    },
  ];

  // ─────────────────────────────────────────────────────────────────────────────
  // Lifecycle
  // ─────────────────────────────────────────────────────────────────────────────

  ngOnInit(): void {
    this.serviciosFiltrados = [...this.servicios];
    // Preseleccionar el Facial de Oro 24K (igual que el diseño original)
    const preselected = this.servicios.find(s => s.id === 3);
    if (preselected) this.servicioSeleccionado = preselected;
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Búsqueda
  // ─────────────────────────────────────────────────────────────────────────────

  filtrarServicios(): void {
    const query = this.searchQuery.trim().toLowerCase();

    if (!query) {
      this.serviciosFiltrados = [...this.servicios];
      return;
    }

    this.serviciosFiltrados = this.servicios.filter(s => {
      const camposCombinados = [
        s.nombre,
        s.categoria,
        s.descripcion,
        ...s.tags,
      ].join(' ').toLowerCase();

      return camposCombinados.includes(query);
    });
  }

  limpiarBusqueda(): void {
    this.searchQuery = '';
    this.filtrarServicios();
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Selección de servicio
  // ─────────────────────────────────────────────────────────────────────────────

  seleccionarServicio(servicio: Servicio): void {
    this.servicioSeleccionado = servicio;
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Complementos
  // ─────────────────────────────────────────────────────────────────────────────

  toggleComplemento(c: Complemento): void {
    c.agregado = !c.agregado;
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Totales
  // ─────────────────────────────────────────────────────────────────────────────

  calcularSubtotal(): number {
    const base = this.servicioSeleccionado?.precio ?? 0;
    const extras = this.complementos
      .filter(c => c.agregado)
      .reduce((sum, c) => sum + c.precio, 0);
    return base + extras;
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Confirmar reserva
  // ─────────────────────────────────────────────────────────────────────────────

  confirmarReserva(): void {
    if (!this.servicioSeleccionado) return;

    const resumen = {
      servicio: this.servicioSeleccionado,
      complementos: this.complementos.filter(c => c.agregado),
      cliente: this.cliente,
      fecha: this.fechaSeleccionada,
      hora: this.horaSeleccionada,
      total: this.calcularSubtotal(),
    };

    console.log('[Spa App] Reserva confirmada:', resumen);

    // TODO: Conectar con tu servicio/API de backend
    // this.reservasService.crearReserva(resumen).subscribe(...)
    // router.navigate(['/reservas/confirmacion', resumen.id])
  }
}