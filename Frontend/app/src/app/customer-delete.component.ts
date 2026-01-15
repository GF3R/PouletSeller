import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from './api.service';
import { Customer } from './models';

@Component({
  selector: 'app-customer-delete',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="panel">
      <h3>Kunde löschen</h3>
      <input placeholder="Name suchen..." [(ngModel)]="query" (ngModelChange)="search()" />
      <div style="margin-top:10px;">
        <div *ngFor="let c of results" class="card" style="margin-bottom:8px;" (click)="confirmDelete(c)">
          <div style="display:flex; justify-content: space-between; align-items:center;">
            <div>
              <strong>{{ c.firstName }} {{ c.lastName }}</strong>
              <div class="muted">{{ c.phone || 'kein Telefon' }}</div>
            </div>
            <span class="badge">löschen</span>
          </div>
        </div>
      </div>
      <p *ngIf="results.length === 0 && query.length > 1" class="muted">Keine Treffer</p>
    </div>
  `
})
export class CustomerDeleteComponent {
  query = '';
  results: Customer[] = [];

  constructor(private api: ApiService) {}

  search() {
    if (this.query.length < 1) {
      this.results = [];
      return;
    }
    this.api.getCustomers(this.query).subscribe((data) => (this.results = data));
  }

  confirmDelete(customer: Customer) {
    const info = `${customer.firstName} ${customer.lastName} ${customer.phone ? '(' + customer.phone + ')' : ''}`;
    if (confirm(`Kunde wirklich löschen?\n${info}`)) {
      this.api.deleteCustomer(customer.id).subscribe(() => this.search());
    }
  }
}
