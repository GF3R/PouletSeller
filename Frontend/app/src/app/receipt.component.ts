import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-receipt',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="panel">
      <div style="display:flex; justify-content: space-between; align-items:flex-start; flex-wrap: wrap;">
        <div>
          <h2 style="margin:0;">Knutti Geflügel</h2>
          <p class="muted" style="margin:4px 0 0;">Oberdorf 366h · 3762 Erlenbach · 079 876 50 70</p>
        </div>
        <div class="badge">Quittung</div>
      </div>
      <hr />
      <p><strong>Kunde:</strong><br />{{ name }}<br />{{ address }}<br />{{ postal }} {{ city }}</p>
      <table>
        <thead>
          <tr>
            <th>Artikel</th>
            <th>Menge</th>
            <th>Datum</th>
            <th>Betrag</th>
            <th>Zahlungsart</th>
            <th>Bemerkung</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>{{ product }}</td>
            <td>{{ quantity }}</td>
            <td>{{ date }}</td>
            <td>{{ amount }} CHF</td>
            <td>{{ payment }}</td>
            <td>{{ note }}</td>
          </tr>
        </tbody>
      </table>
      <div style="margin-top:20px; text-align:center; font-style:italic;">
        Vielen Dank für Ihren Einkauf! — Knutti Geflügel —
      </div>
      <div style="text-align:center; margin-top:16px;">
        <button class="btn" onclick="window.print()">🖨️ Drucken</button>
      </div>
    </div>
  `
})
export class ReceiptComponent {
  name = '';
  address = '';
  postal = '';
  city = '';
  product = '';
  quantity = '';
  date = '';
  amount = '';
  payment = '';
  note = '';

  constructor(route: ActivatedRoute) {
    route.queryParamMap.subscribe((p) => {
      this.name = p.get('name') || '';
      this.address = p.get('address') || '';
      this.postal = p.get('postal') || '';
      this.city = p.get('city') || '';
      this.product = p.get('product') || '';
      this.quantity = p.get('quantity') || '';
      this.date = p.get('date') || '';
      this.amount = p.get('amount') || '';
      this.payment = p.get('payment') || '';
      this.note = p.get('note') || '';
    });
  }
}
