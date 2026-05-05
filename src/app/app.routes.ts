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

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: Login },
  { path: 'dashboard/admin', component: InicioAdmi },
  { path: 'dashboard/admin/agenda', component: Agendaadmi },
  { path: 'dashboard/admin/servicios', component: Serviciosadmi },
  { path: 'dashboard/admin/usuarios', component: Usuariosadmi },
  { path: 'dashboard/admin/reservas', component: ReservasComponent },
  { path: 'dashboard/cliente', component: InicioclienteComponent },
  { path: 'dashboard/recepcionista', component: IniciorecepComponent },
  { path: 'dashboard/terapeuta', component: IniciospeciComponent },
  { path: 'registro', component: RegisterComponent },
  { path: '**', redirectTo: '/login' }
];