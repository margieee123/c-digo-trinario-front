import { Component } from '@angular/core';

@Component({
  selector: 'app-iniciocliente',
  templateUrl: './iniciocliente.html',
  styleUrls: ['./iniciocliente.css']
})
export class InicioclienteComponent {

  // Datos del dashboard – puedes conectarlos a un servicio real
  nombreCliente = 'Julianna';

  proximaCita = {
    tipo: 'Reserva de Tejido Profundo',
    fecha: '14 de Oct, 2024',
    hora: '2:00 PM',
    especialista: 'Elena Vancamp'
  };

  historial = [
    { icono: 'spa',  nombre: 'Masaje de Serenidad Sueco', fecha: '12 de Sept, 2024', precio: '$145.00' },
    { icono: 'face', nombre: 'Facial Hydra-Infusion',     fecha: '28 de Ago, 2024',  precio: '$180.00' }
  ];

  servicios = [
    {
      nombre: 'Masaje con Piedras Volcánicas',
      desc: 'Relajación muscular profunda utilizando minerales terrestres calientes.',
      duracion: '60-90 Min',
      img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBn8RnTTox2KY2FdPeeUu0nDQ3tXlduabQxt-5uPneq60iIAx8-e-Po-osqaiJ62D26QhHulZh8aiPtHTSFVy6tAJugK8IyOKgqBZK41uO4zlaJvXUWEF0K-yFhoj6L6XO4Ydw6oePdpm2n4mAK6zbyPyHI5Tdc5F6n69RFQ6hH_AGWCs_1lqIHS7A8X1rOPStrrbDz3O4h7T5-Ja_Xhm6cPQq3kmxTLGaE3bjOfbh-Y4hyWhX4D8r6TFnc01FPYpCUZhh0qH-swX8'
    },
    {
      nombre: 'Facial de Luminosidad Radiante',
      desc: 'Tratamiento con infusión de oxígeno para una luminosidad inmediata.',
      duracion: '45 Min',
      img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCDin3jqHtOj80_sWdxkIYhpDidRHezXWtMb4xecRFbBrtTuV4fg6TNnX09X3o7zRyScOwQ98ZNAslAJzh7dQVVrzVo00bhnjxc1k_fEDAdWFFK6Lu4kWnTTkoxtyjwKwm8BJNOMOEFjQf8EsMGr47cc0VzvXZImvCKa8tzrp7yoJ5iXXOkerDn6ZMXk937sIuA3WJFq2h4sW9Zz_BzR22pR-GUbdJWrVLOoP-7SA7FcoOzPbjf8OpMOgCNCNwnh3frz8vd4ajxArk'
    },
    {
      nombre: 'Aromaterapia Botánica',
      desc: 'Un viaje sensorial a través de raros aceites botánicos alpinos.',
      duracion: '75 Min',
      img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAvdL87PYNDhZOstYxlSm6fPUxrXCWawtx12YcJKlonk6XUYNabaYxa_bJMTmrHYJeis6sc6VbVeWs95ISY-esd5lg2s3bESzU1RMvfNG3tX-WScSC54Txw6Zy0GIJzTjqg8s6xGrfik1ez7IkkKPftVc7P56ZbA7zMn8UBt89_04skh45X1MasgTsR5uTvjLc5yAce8'
    }
  ];

  calificacion = 4; // estrellas activas
  comentario = '';

  enviarComentario(): void {
    console.log('Calificación:', this.calificacion, '| Comentario:', this.comentario);
    // Aquí conectas con tu servicio de reseñas
  }
}