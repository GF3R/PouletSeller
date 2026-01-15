import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from './api.service';
import { FinanceEntry, FinanceRequest } from './models';

@Component({
  selector: 'app-finance',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="panel">
      <h3>💰 Buchhaltung</h3>
      <div class="grid two">
        <div>
          <h4>Einnahme erfassen</h4>
          <form (ngSubmit)="addIncome()">
            <label>Datum</label>
            <input type="date" [(ngModel)]="incomeForm.date" name="incomeDate" required />
            <label>Produkt</label>
            <input [(ngModel)]="incomeForm.description" name="incomeDesc" />
            <label>Name</label>
            <input [(ngModel)]="incomeForm.person" name="incomePerson" />
            <label>Betrag (CHF)</label>
            <input type="number" step="0.01" [(ngModel)]="incomeForm.amount" name="incomeAmount" required />
            <label>Zahlungsart</label>
            <select [(ngModel)]="incomeForm.paymentMethod" name="incomePayment">
              <option>Bar</option>
              <option>Twint</option>
              <option>Rechnung</option>
              <option>Bitcoin</option>
              <option>Kreditkarte</option>
            </select>
            <label>Bemerkung</label>
            <input [(ngModel)]="incomeForm.note" name="incomeNote" />
            <button class="btn" type="submit">Speichern</button>
          </form>
        </div>
        <div>
          <h4>Ausgabe erfassen</h4>
          <form (ngSubmit)="addExpense()">
            <label>Datum</label>
            <input type="date" [(ngModel)]="expenseForm.date" name="expenseDate" required />
            <label>Beschreibung</label>
            <input [(ngModel)]="expenseForm.description" name="expenseDesc" />
            <label>Lieferant</label>
            <input [(ngModel)]="expenseForm.person" name="expensePerson" />
            <label>Betrag (CHF)</label>
            <input type="number" step="0.01" [(ngModel)]="expenseForm.amount" name="expenseAmount" required />
            <label>Zahlungsart</label>
            <select [(ngModel)]="expenseForm.paymentMethod" name="expensePayment">
              <option>Bar</option>
              <option>Twint</option>
              <option>Rechnung</option>
              <option>Bitcoin</option>
              <option>Kreditkarte</option>
            </select>
            <label>Bemerkung</label>
            <input [(ngModel)]="expenseForm.note" name="expenseNote" />
            <button class="btn" type="submit">Speichern</button>
          </form>
        </div>
      </div>
    </div>

    <div class="panel">
      <div class="toolbar">
        <div>
          <strong>CSV-Export</strong>
          <div class="muted">nach Zeitraum filtern</div>
        </div>
        <input type="date" [(ngModel)]="from" />
        <input type="date" [(ngModel)]="to" />
        <button class="btn ghost" type="button" (click)="reload()">Filter anwenden</button>
        <button class="btn ghost" type="button" (click)="download('income')">Einnahmen CSV</button>
        <button class="btn ghost" type="button" (click)="download('expense')">Ausgaben CSV</button>
        <button class="btn ghost" type="button" (click)="downloadCombined()">Gesamt CSV</button>
      </div>
      <div class="grid two">
        <div>
          <h4>📥 Einnahmen</h4>
          <div *ngFor="let e of incomes" class="card" style="margin-bottom:6px;">
            <div class="flex" style="justify-content: space-between;">
              <div>
                <strong>{{ e.receiptNumber }}</strong> – {{ e.description }} ({{ e.person }})
                <div class="muted">{{ e.date }} · {{ e.paymentMethod }} · {{ e.note }}</div>
              </div>
              <div class="pill">{{ e.amount | number: '1.2-2' }} CHF</div>
            </div>
          </div>
        </div>
        <div>
          <h4>💸 Ausgaben</h4>
          <div *ngFor="let e of expenses" class="card" style="margin-bottom:6px;">
            <div class="flex" style="justify-content: space-between;">
              <div>
                <strong>{{ e.receiptNumber }}</strong> – {{ e.description }} ({{ e.person }})
                <div class="muted">{{ e.date }} · {{ e.paymentMethod }} · {{ e.note }}</div>
              </div>
              <div class="pill" style="background:#fef2f2; color:#b91c1c;">{{ e.amount | number: '1.2-2' }} CHF</div>
            </div>
          </div>
        </div>
      </div>
      <div style="margin-top:12px;">
        <strong>Übersicht:</strong>
        <span class="pill">Einnahmen {{ overview.incomes | number:'1.2-2' }} CHF</span>
        <span class="pill" style="background:#fef2f2; color:#b91c1c;">Ausgaben {{ overview.expenses | number:'1.2-2' }} CHF</span>
        <span class="pill" [ngStyle]="{ background: overview.balance >=0 ? '#ecfdf3' : '#fef2f2', color: overview.balance >=0 ? '#15803d' : '#b91c1c' }">
          Saldo {{ overview.balance | number:'1.2-2' }} CHF
        </span>
      </div>
    </div>
  `
})
export class FinanceComponent implements OnInit {
  incomes: FinanceEntry[] = [];
  expenses: FinanceEntry[] = [];
  overview = { incomes: 0, expenses: 0, balance: 0 };
  from = '';
  to = '';

  incomeForm: FinanceRequest = this.defaultFinance(new Date().toISOString().substring(0, 10));
  expenseForm: FinanceRequest = this.defaultFinance(new Date().toISOString().substring(0, 10));

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.reload();
  }

  reload() {
    this.api.getIncomes(this.from, this.to).subscribe((data) => (this.incomes = data));
    this.api.getExpenses(this.from, this.to).subscribe((data) => (this.expenses = data));
    this.api.getFinanceOverview().subscribe((o) => (this.overview = o));
  }

  addIncome() {
    const payload = { ...this.incomeForm, amount: Number(this.incomeForm.amount) || 0 };
    this.api.addIncome(payload).subscribe(() => {
      this.incomeForm = this.defaultFinance(this.incomeForm.date);
      this.reload();
    });
  }

  addExpense() {
    const payload = { ...this.expenseForm, amount: Number(this.expenseForm.amount) || 0 };
    this.api.addExpense(payload).subscribe(() => {
      this.expenseForm = this.defaultFinance(this.expenseForm.date);
      this.reload();
    });
  }

  download(type: 'income' | 'expense') {
    this.api.downloadCsv(type, this.from, this.to).subscribe((csv) => this.saveFile(csv, `${type}.csv`));
  }

  downloadCombined() {
    this.api.downloadCombinedCsv(this.from, this.to).subscribe((csv) => this.saveFile(csv, `gesamt.csv`));
  }

  private saveFile(content: string, name: string) {
    const blob = new Blob([content], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = name;
    a.click();
    window.URL.revokeObjectURL(url);
  }

  private defaultFinance(date: string): FinanceRequest {
    return {
      date,
      description: '',
      person: '',
      amount: 0,
      paymentMethod: 'Bar',
      note: ''
    };
  }
}
