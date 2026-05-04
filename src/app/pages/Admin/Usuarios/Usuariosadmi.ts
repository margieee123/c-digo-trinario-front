// pages/admin/Usuarios/Usuariosadmi.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';

/* ── Types ────────────────────────────────────────────────── */

type UserTier    = 'gold' | 'silver' | 'bronze';
type UserRol     = 'cliente' | 'especialista' | 'recepcionista' | 'admin';
type UserEstado  = 'activo' | 'inactivo' | 'descanso';
type ToastType   = 'success' | 'error' | 'info';

export interface Cliente {
  id: string;
  nombre: string;
  email: string;
  telefono: string;
  tier: UserTier;
  tierLabel: string;
  ultimaVisita: string;
  avatar: string;
  createdAt: number;
}

export interface Especialista {
  id: string;
  nombre: string;
  email: string;
  telefono: string;
  rol: string;
  estado: UserEstado;
  estadoLabel: string;
  infoIcon: string;
  infoText: string;
  avatar: string;
  createdAt: number;
}

interface UserForm {
  tipo: 'cliente' | 'especialista';
  nombre: string;
  email: string;
  telefono: string;
  // cliente
  tier: UserTier | '';
  ultimaVisita: string;
  // especialista
  rol: string;
  estado: UserEstado | '';
  infoText: string;
  avatar: string;
}

interface Toast {
  id: string;
  message: string;
  type: ToastType;
  icon: string;
}

/* ── Component ────────────────────────────────────────────── */

@Component({
  selector: 'app-usuariosadmi',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './Usuariosadmi.html',
  styleUrls: ['./Usuariosadmi.css']
})
export class Usuariosadmi implements OnInit {

  nombre: string = '';
  tabActivo: string = 'clientes';

  /* ─ Stats ─ */
  stats = [
    { label: 'Total Clientes',        value: '1,240', badge: '+12%', note: '',           gold: true  },
    { label: 'Especialistas Activos', value: '12',    badge: '',     note: 'Operativos',  gold: false },
    { label: 'Nuevos este mes',       value: '+45',   badge: '',     note: 'Registros',   gold: true  }
  ];

  /* ─ Clientes ─ */
  clientes: Cliente[] = [
    {
      id: 'SS-9921', nombre: 'Elena Rodriguez', email: 'elena.rod@example.com',
      telefono: '+34 600 111 222', tier: 'gold', tierLabel: 'Gold Tier',
      ultimaVisita: '12 Oct, 2023', avatar: 'https://i.pravatar.cc/44?img=5',
      createdAt: Date.now() - 86400000 * 10
    },
    {
      id: 'SS-8842', nombre: 'Marcus Thorne', email: 'm.thorne@vogue.com',
      telefono: '+34 600 333 444', tier: 'silver', tierLabel: 'Silver Tier',
      ultimaVisita: '05 Nov, 2023', avatar: 'https://i.pravatar.cc/44?img=12',
      createdAt: Date.now() - 86400000 * 7
    },
    {
      id: 'SS-7104', nombre: 'Sophie Chen', email: 'schen@studio.design',
      telefono: '+34 600 555 666', tier: 'bronze', tierLabel: 'Bronze Tier',
      ultimaVisita: '30 Oct, 2023', avatar: 'https://i.pravatar.cc/44?img=9',
      createdAt: Date.now() - 86400000 * 3
    }
  ];

  /* ─ Especialistas ─ */
  especialistas: Especialista[] = [
    {
      id: 'ESP-001', nombre: 'Dr. Clara Vance', email: 'c.vance@spaapp.com',
      telefono: '+34 600 777 888', rol: 'Especialista en Aromaterapia',
      estado: 'activo', estadoLabel: 'Activo', infoIcon: 'schedule',
      infoText: 'Próxima cita: 14:00', avatar: 'https://i.pravatar.cc/52?img=47',
      createdAt: Date.now() - 86400000 * 20
    },
    {
      id: 'ESP-002', nombre: 'Julian Moss', email: 'j.moss@spaapp.com',
      telefono: '+34 600 999 000', rol: 'Masaje de Tejido Profundo',
      estado: 'descanso', estadoLabel: 'En Descanso', infoIcon: 'timer',
      infoText: 'Vuelve en: 25 min', avatar: 'https://i.pravatar.cc/52?img=33',
      createdAt: Date.now() - 86400000 * 15
    },
    {
      id: 'ESP-003', nombre: 'Amara Kante', email: 'a.kante@spaapp.com',
      telefono: '+34 600 123 456', rol: 'Facial Rituals Expert',
      estado: 'activo', estadoLabel: 'Activo', infoIcon: 'event_available',
      infoText: 'En sesión ahora', avatar: 'https://i.pravatar.cc/52?img=25',
      createdAt: Date.now() - 86400000 * 8
    }
  ];

  /* ─ Modal state ─ */
  showUserModal     = false;
  showConfirmModal  = false;
  isEditing         = false;
  editingId: string | null  = null;
  editingTipo: 'cliente' | 'especialista' = 'cliente';
  deletingId: string | null = null;
  deletingNombre    = '';
  deletingTipo: 'cliente' | 'especialista' = 'cliente';

  /* ─ Form ─ */
  form: UserForm = this.emptyForm('cliente');

  /* ─ Toasts ─ */
  toasts: Toast[] = [];

  /* ─ Opciones ─ */
  readonly tierOpciones = [
    { value: 'gold',   label: 'Gold Tier'   },
    { value: 'silver', label: 'Silver Tier' },
    { value: 'bronze', label: 'Bronze Tier' }
  ];

  readonly estadoOpciones = [
    { value: 'activo',   label: 'Activo'      },
    { value: 'descanso', label: 'En Descanso' },
    { value: 'inactivo', label: 'Inactivo'    }
  ];

  readonly rolOpciones = [
    'Especialista en Aromaterapia',
    'Masaje de Tejido Profundo',
    'Facial Rituals Expert',
    'Terapeuta Senior',
    'Director de Clínica',
    'Maestra Esteticista'
  ];

  /* ══════════════════════════════════════
     LIFECYCLE
  ══════════════════════════════════════ */

  constructor(private readonly router: Router) {}

  ngOnInit(): void {
    this.nombre = localStorage.getItem('nombre') || 'Administrador';
  }

  cerrarSesion(): void {
    localStorage.clear();
    this.router.navigate(['/login']);
  }

  /* ══════════════════════════════════════
     MODAL — ABRIR / CERRAR
  ══════════════════════════════════════ */

  /** Abre modal para NUEVO cliente */
  openAddCliente(): void {
    this.isEditing    = false;
    this.editingId    = null;
    this.form         = this.emptyForm('cliente');
    this.showUserModal = true;
    document.body.style.overflow = 'hidden';
  }

  /** Abre modal para NUEVO especialista */
  openAddEspecialista(): void {
    this.isEditing    = false;
    this.editingId    = null;
    this.form         = this.emptyForm('especialista');
    this.showUserModal = true;
    document.body.style.overflow = 'hidden';
  }

  /** Abre modal para EDITAR cliente */
  openEditCliente(c: Cliente): void {
    this.isEditing    = true;
    this.editingId    = c.id;
    this.editingTipo  = 'cliente';
    this.form = {
      tipo: 'cliente',
      nombre: c.nombre,
      email: c.email,
      telefono: c.telefono,
      tier: c.tier,
      ultimaVisita: c.ultimaVisita,
      rol: '', estado: '', infoText: '',
      avatar: c.avatar
    };
    this.showUserModal = true;
    document.body.style.overflow = 'hidden';
  }

  /** Abre modal para EDITAR especialista */
  openEditEspecialista(e: Especialista): void {
    this.isEditing    = true;
    this.editingId    = e.id;
    this.editingTipo  = 'especialista';
    this.form = {
      tipo: 'especialista',
      nombre: e.nombre,
      email: e.email,
      telefono: e.telefono,
      rol: e.rol,
      estado: e.estado,
      infoText: e.infoText,
      tier: '', ultimaVisita: '',
      avatar: e.avatar
    };
    this.showUserModal = true;
    document.body.style.overflow = 'hidden';
  }

  closeUserModal(): void {
    this.showUserModal           = false;
    document.body.style.overflow = '';
  }

  /* ══════════════════════════════════════
     FORM — SUBMIT
  ══════════════════════════════════════ */

  submitForm(): void {
    if (!this.validateForm()) {
      this.showToast('Complete los campos requeridos', 'error');
      return;
    }

    if (this.form.tipo === 'cliente') {
      this.submitCliente();
    } else {
      this.submitEspecialista();
    }

    this.closeUserModal();
  }

  private submitCliente(): void {
    if (this.isEditing && this.editingId) {
      const idx = this.clientes.findIndex(c => c.id === this.editingId);
      if (idx !== -1) {
        this.clientes[idx] = {
          ...this.clientes[idx],
          nombre: this.form.nombre.trim(),
          email: this.form.email.trim(),
          telefono: this.form.telefono.trim(),
          tier: this.form.tier as UserTier,
          tierLabel: this.tierLabel(this.form.tier as UserTier),
          ultimaVisita: this.form.ultimaVisita || this.clientes[idx].ultimaVisita,
          avatar: this.form.avatar || this.clientes[idx].avatar
        };
        this.clientes = [...this.clientes];
        this.showToast('Cliente actualizado correctamente', 'success');
      }
    } else {
      const nuevo: Cliente = {
        id: 'SS-' + Math.floor(1000 + Math.random() * 9000),
        nombre: this.form.nombre.trim(),
        email: this.form.email.trim(),
        telefono: this.form.telefono.trim(),
        tier: this.form.tier as UserTier,
        tierLabel: this.tierLabel(this.form.tier as UserTier),
        ultimaVisita: 'Hoy',
        avatar: this.form.avatar || 'https://i.pravatar.cc/44?img=' + Math.floor(Math.random() * 70),
        createdAt: Date.now()
      };
      this.clientes = [nuevo, ...this.clientes];
      this.showToast('Cliente creado exitosamente', 'success');
    }
  }

  private submitEspecialista(): void {
    const estadoLabel = this.estadoOpciones.find(o => o.value === this.form.estado)?.label || '';

    if (this.isEditing && this.editingId) {
      const idx = this.especialistas.findIndex(e => e.id === this.editingId);
      if (idx !== -1) {
        this.especialistas[idx] = {
          ...this.especialistas[idx],
          nombre: this.form.nombre.trim(),
          email: this.form.email.trim(),
          telefono: this.form.telefono.trim(),
          rol: this.form.rol.trim(),
          estado: this.form.estado as UserEstado,
          estadoLabel,
          infoText: this.form.infoText.trim(),
          avatar: this.form.avatar || this.especialistas[idx].avatar
        };
        this.especialistas = [...this.especialistas];
        this.showToast('Especialista actualizado correctamente', 'success');
      }
    } else {
      const nuevo: Especialista = {
        id: 'ESP-' + Math.floor(100 + Math.random() * 900),
        nombre: this.form.nombre.trim(),
        email: this.form.email.trim(),
        telefono: this.form.telefono.trim(),
        rol: this.form.rol.trim(),
        estado: this.form.estado as UserEstado,
        estadoLabel,
        infoIcon: 'schedule',
        infoText: this.form.infoText.trim() || 'Disponible',
        avatar: this.form.avatar || 'https://i.pravatar.cc/52?img=' + Math.floor(Math.random() * 70),
        createdAt: Date.now()
      };
      this.especialistas = [nuevo, ...this.especialistas];
      this.showToast('Especialista creado exitosamente', 'success');
    }
  }

  /* ══════════════════════════════════════
     ELIMINAR
  ══════════════════════════════════════ */

  openConfirmDeleteCliente(c: Cliente): void {
    this.deletingId     = c.id;
    this.deletingNombre = c.nombre;
    this.deletingTipo   = 'cliente';
    this.showConfirmModal = true;
    document.body.style.overflow = 'hidden';
  }

  openConfirmDeleteEspecialista(e: Especialista): void {
    this.deletingId     = e.id;
    this.deletingNombre = e.nombre;
    this.deletingTipo   = 'especialista';
    this.showConfirmModal = true;
    document.body.style.overflow = 'hidden';
  }

  closeConfirmModal(): void {
    this.showConfirmModal        = false;
    document.body.style.overflow = '';
  }

  confirmDelete(): void {
    if (!this.deletingId) return;
    const nombre = this.deletingNombre;

    if (this.deletingTipo === 'cliente') {
      this.clientes = this.clientes.filter(c => c.id !== this.deletingId);
    } else {
      this.especialistas = this.especialistas.filter(e => e.id !== this.deletingId);
    }

    this.showToast(`"${nombre}" eliminado`, 'error');
    this.deletingId = null;
    this.closeConfirmModal();
  }

  /* ══════════════════════════════════════
     TOASTS
  ══════════════════════════════════════ */

  showToast(message: string, type: ToastType = 'info'): void {
    const icons: Record<ToastType, string> = {
      success: 'check_circle', error: 'error', info: 'info'
    };
    const t: Toast = { id: this.genId(), message, type, icon: icons[type] };
    this.toasts.push(t);
    setTimeout(() => {
      this.toasts = this.toasts.filter(x => x.id !== t.id);
    }, 3000);
  }

  trackToast(_: number, t: Toast): string { return t.id; }

  /* ══════════════════════════════════════
     HELPERS
  ══════════════════════════════════════ */

  private emptyForm(tipo: 'cliente' | 'especialista'): UserForm {
    return {
      tipo, nombre: '', email: '', telefono: '',
      tier: '', ultimaVisita: '',
      rol: '', estado: '', infoText: '', avatar: ''
    };
  }

  private validateForm(): boolean {
    const { nombre, email, tipo, tier, rol, estado } = this.form;
    if (!nombre.trim() || !email.trim()) return false;
    if (tipo === 'cliente')     return !!tier;
    if (tipo === 'especialista') return !!(rol.trim() && estado);
    return false;
  }

  private tierLabel(tier: UserTier): string {
    const map: Record<UserTier, string> = {
      gold: 'Gold Tier', silver: 'Silver Tier', bronze: 'Bronze Tier'
    };
    return map[tier];
  }

  private genId(): string {
    return Math.random().toString(36).slice(2, 9);
  }
}