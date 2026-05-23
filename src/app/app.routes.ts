import { Routes } from '@angular/router';
import { Login } from './pages/Auth/login/login';
import { InicioAdmi } from './pages/Admin/inicio/inicioadmi';
import { InicioclienteComponent } from './pages/Cliente/iniciocliente/iniciocliente';
import { IniciorecepComponent } from './pages/Recepcionista/iniciorecep/iniciorecep';
import { IniciospeciComponent } from './pages/Especialista/inicioespeci/inicioespeci';
import { RegisterComponent } from './pages/Auth/register/register';
import { Serviciosadmi } from './pages/Admin/Servicios/Serviciosadmi';
import { Usuariosadmi } from './pages/Admin/Usuarios/Usuariosadmi';
import { Agendaadmi } from './pages/Admin/Agenda/Agendaadmi';
import { ReservasComponent } from './pages/Admin/Reservas/Nuevares';
import { FacturacionComponent } from './pages/Admin/Facturacion/Facturacion';
import { ConfiguracionComponent } from './pages/Configuracion/Configuracion';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: Login },

  // ─── ADMIN ───────────────────────────────────────────────
  { path: 'dashboard/admin', component: InicioAdmi },
  { path: 'dashboard/admin/agenda', component: Agendaadmi },
  { path: 'dashboard/admin/servicios', component: Serviciosadmi },
  { path: 'dashboard/admin/usuarios', component: Usuariosadmi },
  { path: 'dashboard/admin/reservas', component: ReservasComponent },
  { path: 'dashboard/admin/facturacion', component: FacturacionComponent },

  // ─── RECEPCIONISTA ────────────────────────────────────────
  { path: 'dashboard/recepcionista', component: IniciorecepComponent },
  { path: 'dashboard/recepcionista/agenda', component: Agendaadmi },
  { path: 'dashboard/recepcionista/reservas', component: ReservasComponent },
  { path: 'dashboard/recepcionista/facturacion', component: FacturacionComponent },

  // ─── TERAPEUTA ────────────────────────────────────────────
  { path: 'dashboard/terapeuta', component: IniciospeciComponent },
  { path: 'dashboard/terapeuta/agenda', component: Agendaadmi },

  // ─── CLIENTE ─────────────────────────────────────────────
{ path: 'dashboard/cliente', component: InicioclienteComponent },
{ path: 'dashboard/cliente/reservas', component: ReservasComponent },
  // ─── COMPARTIDAS ─────────────────────────────────────────
  { path: 'dashboard/configuracion', component: ConfiguracionComponent },

  { path: 'registro', component: RegisterComponent },
  { path: '**', redirectTo: '/login' }
];