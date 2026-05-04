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
  { path: 'inicio/admin', component: InicioAdmi },
  { path: 'dashboard/agenda', component: Agendaadmi },
  { path: 'dashboard/cliente', component: InicioclienteComponent },
  { path: 'dashboard/recepcionista', component: IniciorecepComponent },
  { path: 'dashboard/especialista', component: IniciospeciComponent },
  { path: 'registro', component: RegisterComponent },
  { path: 'servicios/admin', component: Serviciosadmi },
  { path: 'usuarios/admin', component: Usuariosadmi },
  { path: 'nueva-reserva', component: ReservasComponent },
  { path: '**', redirectTo: '/login' }
];  