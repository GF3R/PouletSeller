import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from './api.service';
import { Customer } from './models';

@Component({
  selector: 'app-customer-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="panel">
      <h3>Kundenliste</h3>
      <div style="overflow:auto; max-height:70vh;">
        <table>
          <thead>
            <tr>
              <th>Vorname</th>
              <th>Nachname</th>
              <th>P. Spezial</th>
              <th>Stück</th>
              <th>3 kg</th>
              <th>T 5 kg</th>
              <th>T 10 kg</th>
              <th>Adresse</th>
              <th>PLZ</th>
              <th>Ort</th>
              <th>Info</th>
              <th>Telefon</th>
              <th>Umsatz Poulet</th>
              <th>Umsatz Truten</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let c of customers">
              <td>{{ c.firstName }}</td>
              <td>{{ c.lastName }}</td>
              <td>{{ c.pouletSpezial }}</td>
              <td>{{ c.pouletSpezialStueck }}</td>
              <td>{{ c.poulet3kg }}</td>
              <td>{{ c.truten5kg }}</td>
              <td>{{ c.truten10kg }}</td>
              <td>{{ c.address }}</td>
              <td>{{ c.postalCode }}</td>
              <td>{{ c.city }}</td>
              <td>{{ c.infoChannel }}</td>
              <td>{{ c.phone }}</td>
              <td>{{ c.umsatzPoulet | number: '1.2-2' }}</td>
              <td>{{ c.umsatzTruten | number: '1.2-2' }}</td>
              <td>{{ c.umsatzTotal | number: '1.2-2' }}</td>
            </tr>
            <tr *ngIf="customers.length" style="font-weight:bold; background:#e8f1ff;">
              <td colspan=\"2\">Total</td>
              <td>{{ sums.pSpezial | number:'1.0-0' }}</td>
              <td>{{ sums.pStk | number:'1.0-0' }}</td>
              <td>{{ sums.p3 | number:'1.0-0' }}</td>
              <td>{{ sums.t5 | number:'1.0-0' }}</td>
              <td>{{ sums.t10 | number:'1.0-0' }}</td>
              <td colspan=\"4\"></td>
              <td>{{ sums.uPou | number:'1.2-2' }}</td>
              <td>{{ sums.uTru | number:'1.2-2' }}</td>
              <td>{{ sums.uTot | number:'1.2-2' }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `
})
export class CustomerListComponent implements OnInit {
  customers: Customer[] = [];
  sums = { pSpezial: 0, pStk: 0, p3: 0, t5: 0, t10: 0, uPou: 0, uTru: 0, uTot: 0 };

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.load();
  }

  load() {
    this.api.getCustomers().subscribe((data) => {
      this.customers = data;
      this.sums = {
        pSpezial: data.reduce((a, c) => a + c.pouletSpezial, 0),
        pStk: data.reduce((a, c) => a + c.pouletSpezialStueck, 0),
        p3: data.reduce((a, c) => a + c.poulet3kg, 0),
        t5: data.reduce((a, c) => a + c.truten5kg, 0),
        t10: data.reduce((a, c) => a + c.truten10kg, 0),
        uPou: data.reduce((a, c) => a + c.umsatzPoulet, 0),
        uTru: data.reduce((a, c) => a + c.umsatzTruten, 0),
        uTot: data.reduce((a, c) => a + c.umsatzTotal, 0)
      };
    });
  }
}
