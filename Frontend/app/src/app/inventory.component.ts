import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from './api.service';
import { InventoryData } from './models';

@Component({
  selector: 'app-inventory',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="panel">
      <h3>Gefrier-Bestand</h3>
      <form (ngSubmit)="save()" class="grid two">
        <div>
          <label>Poulet Mischpaket 3 kg</label>
          <input type="number" [(ngModel)]="data.poulet3kg" name="p3" />
        </div>
        <div>
          <label>Truten 5 kg</label>
          <input type="number" [(ngModel)]="data.truten5kg" name="t5" />
        </div>
        <div>
          <label>Truten 10 kg</label>
          <input type="number" [(ngModel)]="data.truten10kg" name="t10" />
        </div>
        <div>
          <label>Brüstchen</label>
          <input type="number" [(ngModel)]="data.brustchen" name="br" />
        </div>
        <div>
          <label>Oberschenkel-Stück</label>
          <input type="number" [(ngModel)]="data.oberschenkel" name="ob" />
        </div>
        <div>
          <label>Flügel-Stück</label>
          <input type="number" [(ngModel)]="data.fluegel" name="fl" />
        </div>
        <div>
          <label>Unterschenkel-Stück</label>
          <input type="number" [(ngModel)]="data.unterschenkel" name="un" />
        </div>
        <div style="grid-column: span 2; margin-top:12px;">
          <button class="btn" type="submit">Speichern</button>
          <span *ngIf="saved" class="pill">✅ Bestand gespeichert</span>
        </div>
      </form>
    </div>
  `
})
export class InventoryComponent implements OnInit {
  data: InventoryData = {
    poulet3kg: 0,
    truten5kg: 0,
    truten10kg: 0,
    brustchen: 0,
    oberschenkel: 0,
    fluegel: 0,
    unterschenkel: 0
  };
  saved = false;

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.load();
  }

  load() {
    this.api.getInventory().subscribe((d) => (this.data = d));
  }

  save() {
    this.api.saveInventory(this.data).subscribe((d) => {
      this.data = d;
      this.saved = true;
    });
  }
}
