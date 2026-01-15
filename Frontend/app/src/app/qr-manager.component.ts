import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from './api.service';

@Component({
  selector: 'app-qr-manager',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="grid three">
      <div class="panel">
        <h3>TWINT QR-Code</h3>
        <img *ngIf="paths['twint']" [src]="paths['twint']" alt="TWINT" style="max-width:100%; border-radius:12px;" />
        <p *ngIf="!paths['twint']" class="muted">Noch kein QR hochgeladen</p>
        <input type="file" (change)="onFile($event, 'twint')" accept=".jpg,.jpeg,.png" />
      </div>
      <div class="panel">
        <h3>Google Bewertung</h3>
        <img *ngIf="paths['google']" [src]="paths['google']" alt="Google" style="max-width:100%; border-radius:12px;" />
        <p *ngIf="!paths['google']" class="muted">Noch kein QR hochgeladen</p>
        <input type="file" (change)="onFile($event, 'google')" accept=".jpg,.jpeg,.png" />
      </div>
      <div class="panel">
        <h3>Logo</h3>
        <img *ngIf="paths['logo']" [src]="paths['logo']" alt="Logo" style="max-width:100%; border-radius:12px;" />
        <p *ngIf="!paths['logo']" class="muted">Noch kein Logo</p>
        <input type="file" (change)="onFile($event, 'logo')" accept=".jpg,.jpeg,.png" />
      </div>
    </div>
  `
})
export class QrManagerComponent implements OnInit {
  paths: Record<string, string> = {};

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.load();
  }

  load() {
    this.api.listUploads().subscribe((files) => {
      this.paths = {};
      files.forEach((f) => (this.paths[f.name] = f.path));
    });
  }

  onFile(event: Event, kind: 'twint' | 'google' | 'logo') {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    this.api.upload(kind, file).subscribe((res) => {
      this.paths[kind] = res.path;
    });
  }
}
