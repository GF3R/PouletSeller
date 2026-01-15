import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="grid two">
      <div class="card" routerLink="/customers/new">1️⃣ Kunde erfassen</div>
      <div class="card" routerLink="/customers/delete">2️⃣ Kunde löschen</div>
      <div class="card" routerLink="/customers/orders">3️⃣ Bestellungen</div>
      <div class="card" routerLink="/sales">4️⃣ Verkauf</div>
      <div class="card" routerLink="/qr">5️⃣ TWINT & Google QR</div>
      <div class="card" routerLink="/customers/list">6️⃣ Kundenliste</div>
      <div class="card" routerLink="/finance">7️⃣ Buchhaltung</div>
      <div class="card" routerLink="/inventory">8️⃣ Bestand</div>
    </div>
  `
})
export class DashboardComponent {}
