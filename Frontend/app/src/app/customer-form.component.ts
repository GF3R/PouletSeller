import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from './api.service';
import { CustomerRequest } from './models';

@Component({
  selector: 'app-customer-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="panel">
      <h3>Kunde erfassen</h3>
      <form (ngSubmit)="save()" class="grid two" style="margin-top: 8px;">
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
          <input [(ngModel)]="form.phone" name="phone" placeholder="+41..." />
        </div>
        <div>
          <label>Informationskanal</label>
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
          <span *ngIf="saved" class="pill">✅ Kunde gespeichert</span>
        </div>
      </form>
    </div>
  `
})
export class CustomerFormComponent {
  infoChannels = ['WhatsApp', 'Threema', 'E-Mail', 'Anruf', 'SMS'];
  saving = false;
  saved = false;
  form: CustomerRequest = this.defaultForm();

  constructor(private api: ApiService) {}

  save() {
    this.saving = true;
    this.saved = false;
    const payload = this.normalize(this.form);
    this.api.createCustomer(payload).subscribe({
      next: () => {
        this.saved = true;
        this.saving = false;
        this.form = this.defaultForm();
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
