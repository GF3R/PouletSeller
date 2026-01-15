import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from './api.service';
import { Customer, CustomerRequest } from './models';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="panel">
      <h3>Bestellungen bearbeiten</h3>
      <input placeholder="Name suchen..." [(ngModel)]="query" (ngModelChange)="search()" />
      <div class="grid two" style="margin-top:10px;">
        <div *ngFor="let c of results" class="card" (click)="select(c)">
          <strong>{{ c.firstName }} {{ c.lastName }}</strong>
          <div class="muted">{{ c.address }}</div>
          <div class="badge">Bestellt: PS {{ c.pouletSpezial }} | Stück {{ c.pouletSpezialStueck }} | 3kg {{ c.poulet3kg }} | T5 {{ c.truten5kg }} | T10 {{ c.truten10kg }}</div>
        </div>
      </div>
      <p *ngIf="results.length === 0 && query.length > 1" class="muted">Keine Treffer</p>
    </div>

    <div class="panel" *ngIf="selected as s">
      <h3>{{ s.firstName }} {{ s.lastName }}</h3>
      <form (ngSubmit)="save()" class="grid two">
        <div>
          <label>Vorname</label>
          <input [(ngModel)]="form.firstName" name="firstName" required />
        </div>
        <div>
          <label>Nachname</label>
          <input [(ngModel)]="form.lastName" name="lastName" required />
        </div>
        <div>
          <label>Poulet Spezial</label>
          <input type="number" [(ngModel)]="form.pouletSpezial" name="pouletSpezial" />
        </div>
        <div>
          <label>Poulet Spezial Stück</label>
          <input type="number" [(ngModel)]="form.pouletSpezialStueck" name="pouletSpezialStueck" />
        </div>
        <div>
          <label>Poulet 3kg</label>
          <input type="number" [(ngModel)]="form.poulet3kg" name="poulet3kg" />
        </div>
        <div>
          <label>Truten 5kg</label>
          <input type="number" [(ngModel)]="form.truten5kg" name="truten5kg" />
        </div>
        <div>
          <label>Truten 10kg</label>
          <input type="number" [(ngModel)]="form.truten10kg" name="truten10kg" />
        </div>
        <div>
          <label>Telefon</label>
          <input [(ngModel)]="form.phone" name="phone" />
        </div>
        <div>
          <label>Info-Kanal</label>
          <select [(ngModel)]="form.infoChannel" name="infoChannel">
            <option *ngFor="let c of infoChannels" [value]="c">{{ c }}</option>
          </select>
        </div>
        <div class="grid two" style="grid-column: span 2;">
          <div>
            <label>Adresse</label>
            <input [(ngModel)]="form.address" name="address" />
          </div>
          <div>
            <label>PLZ / Ort</label>
            <div class="grid two">
              <input [(ngModel)]="form.postalCode" name="postalCode" placeholder="PLZ" />
              <input [(ngModel)]="form.city" name="city" placeholder="Ort" />
            </div>
          </div>
        </div>
        <div style="grid-column: span 2; display:flex; gap:10px; align-items:center;">
          <button class="btn" type="submit" [disabled]="saving">Speichern</button>
          <span *ngIf="saved" class="pill">✅ Änderungen gespeichert</span>
        </div>
      </form>
    </div>
  `
})
export class OrdersComponent {
  query = '';
  results: Customer[] = [];
  selected: Customer | null = null;
  form: CustomerRequest = this.defaultForm();
  saving = false;
  saved = false;
  infoChannels = ['WhatsApp', 'Threema', 'E-Mail', 'Anruf', 'SMS'];

  constructor(private api: ApiService) {}

  search() {
    if (this.query.length < 1) {
      this.results = [];
      return;
    }
    this.api.getCustomers(this.query).subscribe((data) => (this.results = data));
  }

  select(c: Customer) {
    this.selected = c;
    this.form = {
      firstName: c.firstName,
      lastName: c.lastName,
      pouletSpezial: c.pouletSpezial,
      pouletSpezialStueck: c.pouletSpezialStueck,
      poulet3kg: c.poulet3kg,
      truten5kg: c.truten5kg,
      truten10kg: c.truten10kg,
      address: c.address,
      postalCode: c.postalCode,
      city: c.city,
      infoChannel: c.infoChannel,
      phone: c.phone
    };
    this.saved = false;
  }

  save() {
    if (!this.selected || !this.form) {
      return;
    }
    this.saving = true;
    const payload = this.normalize(this.form);
    this.api.updateCustomer(this.selected.id, payload).subscribe({
      next: (updated) => {
        this.selected = updated;
        this.saving = false;
        this.saved = true;
      },
      error: () => (this.saving = false)
    });
  }

  private normalize(data: CustomerRequest): CustomerRequest {
    return {
      ...data,
      pouletSpezial: Number(data.pouletSpezial) || 0,
      pouletSpezialStueck: Number(data.pouletSpezialStueck) || 0,
      poulet3kg: Number(data.poulet3kg) || 0,
      truten5kg: Number(data.truten5kg) || 0,
      truten10kg: Number(data.truten10kg) || 0
    };
  }

  private defaultForm(): CustomerRequest {
    return {
      firstName: '',
      lastName: '',
      pouletSpezial: 0,
      pouletSpezialStueck: 0,
      poulet3kg: 0,
      truten5kg: 0,
      truten10kg: 0,
      address: '',
      postalCode: '',
      city: '',
      infoChannel: 'WhatsApp',
      phone: ''
    };
  }
}
