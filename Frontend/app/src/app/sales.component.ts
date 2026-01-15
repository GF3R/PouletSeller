import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from './api.service';
import { Customer, DiscountConfig, SaleRequest, SaleResponse } from './models';

interface ProductCard {
  key: string;
  label: string;
  quantity: number;
}

@Component({
  selector: 'app-sales',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="panel">
      <h3>Verkauf – Kunde suchen</h3>
      <input placeholder="Name..." [(ngModel)]="query" (ngModelChange)="search()" />
      <div class="grid two" style="margin-top:10px;">
        <div *ngFor="let c of results" class="card" (click)="selectCustomer(c)">
          <strong>{{ c.firstName }} {{ c.lastName }}</strong>
          <div class="muted">{{ c.address }}</div>
          <div class="badge">Tel: {{ c.phone || 'kein Telefon' }}</div>
        </div>
      </div>
      <p *ngIf="results.length === 0 && query.length > 1" class="muted">Keine Treffer</p>
    </div>

    <div class="panel" *ngIf="selected as s">
      <h3>{{ s.firstName }} {{ s.lastName }}</h3>
      <div class="grid two">
        <div *ngFor="let p of products" class="card" (click)="selectProduct(p)">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <div>
              <strong>{{ p.label }}</strong>
              <div class="muted">Bestellt: {{ p.quantity }}</div>
            </div>
            <span class="badge">Auswählen</span>
          </div>
        </div>
      </div>
    </div>

    <div class="panel" *ngIf="selectedProduct && selected">
      <h3>Verkauf abschliessen – {{ selectedProduct.label }}</h3>
      <form (ngSubmit)="finishSale()">
        <div class="grid two">
          <div>
            <label>Datum</label>
            <input type="date" [(ngModel)]="saleDate" name="saleDate" required />
          </div>
          <div>
            <label>Betrag (CHF)</label>
            <input type="number" step="0.01" [(ngModel)]="amount" name="amount" (input)="recalc()" required />
          </div>
        </div>

        <div class="panel" style="background:#e8f1ff; margin:12px 0;">
          <div class="flex" style="justify-content: space-between; align-items:center; flex-wrap: wrap;">
            <div>
              <strong>Rabatt</strong>
              <div class="muted">Modus: {{ discount.mode }} – Wert: {{ discount.value }}</div>
              <div class="muted">Total nach Rabatt: <strong>{{ finalAmount | number:'1.2-2' }} CHF</strong></div>
            </div>
            <div class="flex" style="gap:8px;">
              <select [(ngModel)]="discount.mode" name="discountMode" (change)="recalc()">
                <option value="NONE">Kein Rabatt</option>
                <option value="PERCENT">Prozent (%)</option>
                <option value="ABS">Fix (CHF)</option>
              </select>
              <input type="number" step="0.01" [(ngModel)]="discount.value" name="discountValue" (input)="recalc()" />
              <button type="button" class="btn secondary" (click)="saveDiscount()">Speichern</button>
            </div>
          </div>
        </div>

        <div class="grid two">
          <div>
            <label>Zahlungsart</label>
            <select [(ngModel)]="payment" name="payment">
              <option>Bar</option>
              <option>Twint</option>
              <option>Rechnung</option>
              <option>Bitcoin</option>
              <option>Kreditkarte</option>
            </select>
          </div>
          <div>
            <label>Bemerkung</label>
            <input [(ngModel)]="note" name="note" placeholder="Transaktions-ID oder Notiz" />
          </div>
        </div>

        <div class="toolbar" style="margin-top:14px;">
          <button type="button" class="btn ghost" (click)="showTwint = true">📱 TWINT anzeigen</button>
          <button type="button" class="btn ghost" (click)="showGoogle = true">⭐ Google Bewertung</button>
          <button type="button" class="btn ghost" (click)="openReceipt()">Quittung</button>
        </div>

        <div style="margin-top:12px;">
          <button class="btn" type="submit" [disabled]="saving">✅ Abschliessen</button>
          <span *ngIf="saved" class="pill">✅ Verkauf gespeichert</span>
        </div>
      </form>
    </div>

    <div class="panel" *ngIf="saleResult">
      <h4>Erfolg</h4>
      <p>Beleg: {{ saleResult.finance.receiptNumber }} – Betrag {{ saleResult.finance.amount | number:'1.2-2' }} CHF</p>
      <p class="muted">Bestand aktualisiert (verkauft: {{ saleResult.quantity }})</p>
    </div>

    <div class="overlay" *ngIf="showTwint" (click)="showTwint = false">
      <img *ngIf="twintPath" [src]="twintPath" alt="TWINT" />
      <p *ngIf="!twintPath" class="muted">Kein TWINT-Bild hochgeladen</p>
    </div>
    <div class="overlay" *ngIf="showGoogle" (click)="showGoogle = false">
      <img *ngIf="googlePath" [src]="googlePath" alt="Google" />
      <p *ngIf="!googlePath" class="muted">Kein Google-QR hochgeladen</p>
    </div>
  `,
  styles: [
    `
      .overlay {
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
      }
      .overlay img {
        max-width: 90%;
        max-height: 90%;
        border: 6px solid white;
        border-radius: 12px;
        box-shadow: 0 10px 28px rgba(0, 0, 0, 0.35);
      }
    `
  ]
})
export class SalesComponent implements OnInit {
  query = '';
  results: Customer[] = [];
  selected: Customer | null = null;
  products: ProductCard[] = [];
  selectedProduct: ProductCard | null = null;

  saleDate = this.today();
  amount = 0;
  finalAmount = 0;
  payment = 'Twint';
  note = '';
  discount: DiscountConfig = { mode: 'NONE', value: 0 };

  showTwint = false;
  showGoogle = false;
  twintPath = '';
  googlePath = '';

  saving = false;
  saved = false;
  saleResult: SaleResponse | null = null;

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.loadDiscount();
    this.loadUploads();
  }

  search() {
    if (this.query.length < 1) {
      this.results = [];
      return;
    }
    this.api.getCustomers(this.query).subscribe((data) => (this.results = data));
  }

  selectCustomer(c: Customer) {
    this.selected = c;
    this.products = [
      { key: 'Poulet Spezial', label: 'Poulet Spezial', quantity: c.pouletSpezial },
      { key: 'Poulet Spezial Stück', label: 'Poulet Spezial Stück', quantity: c.pouletSpezialStueck },
      { key: 'Poulet 3kg', label: 'Poulet 3kg', quantity: c.poulet3kg },
      { key: 'Truten 5kg', label: 'Truten 5kg', quantity: c.truten5kg },
      { key: 'Truten 10kg', label: 'Truten 10kg', quantity: c.truten10kg }
    ];
    this.selectedProduct = null;
    this.saleResult = null;
    this.amount = 0;
    this.recalc();
  }

  selectProduct(p: ProductCard) {
    this.selectedProduct = p;
    this.recalc();
  }

  finishSale() {
    if (!this.selected || !this.selectedProduct) {
      return;
    }

    const payload: SaleRequest = {
      customerId: this.selected.id,
      product: this.selectedProduct.key,
      quantity: this.selectedProduct.quantity,
      date: this.saleDate,
      baseAmount: this.amount,
      finalAmount: this.finalAmount,
      paymentMethod: this.payment,
      note: this.note
    };

    this.saving = true;
    this.saved = false;
    this.api.submitSale(payload).subscribe({
      next: (res) => {
        this.saleResult = res;
        this.saved = true;
        this.saving = false;
        this.selected = res.customer;
        this.selectCustomer(res.customer);
      },
      error: () => (this.saving = false)
    });
  }

  recalc() {
    const base = Number(this.amount) || 0;
    if (this.discount.mode === 'PERCENT') {
      this.finalAmount = Math.max(0, base - base * (this.discount.value / 100));
    } else if (this.discount.mode === 'ABS') {
      this.finalAmount = Math.max(0, base - this.discount.value);
    } else {
      this.finalAmount = base;
    }
  }

  saveDiscount() {
    this.api.saveDiscount(this.discount).subscribe((c) => {
      this.discount = c;
      this.recalc();
    });
  }

  loadDiscount() {
    this.api.getDiscount().subscribe((c) => {
      this.discount = c;
      this.recalc();
    });
  }

  loadUploads() {
    this.api.listUploads().subscribe((files) => {
      this.twintPath = files.find((f) => f.name === 'twint')?.path || '';
      this.googlePath = files.find((f) => f.name === 'google')?.path || '';
    });
  }

  openReceipt() {
    if (!this.selected || !this.selectedProduct) {
      return;
    }
    const params = new URLSearchParams({
      name: `${this.selected.firstName} ${this.selected.lastName}`,
      address: this.selected.address,
      postal: this.selected.postalCode,
      city: this.selected.city,
      product: this.selectedProduct.label,
      quantity: String(this.selectedProduct.quantity),
      date: this.saleDate,
      amount: this.finalAmount.toFixed(2),
      payment: this.payment,
      note: this.note
    });
    window.open(`/receipt?${params.toString()}`, '_blank');
  }

  today() {
    return new Date().toISOString().substring(0, 10);
  }
}
