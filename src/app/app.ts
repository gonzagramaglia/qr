import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import * as QRCode from 'qrcode';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  url = signal<string>('https://google.com');
  qrDataUrl = signal<string | null>(null);
  errorMessage = signal<string | null>(null);

  constructor() {
    this.generateQr();
  }

  async generateQr() {
    const text = this.url().trim();
    if (!text) {
      this.qrDataUrl.set(null);
      this.errorMessage.set(null);
      return;
    }

    try {
      this.errorMessage.set(null);
      const dataUrl = await QRCode.toDataURL(text, {
        width: 420,
        margin: 2,
        errorCorrectionLevel: 'M',
        color: {
          dark: '#0f172a',
          light: '#ffffff',
        },
      });
      this.qrDataUrl.set(dataUrl);
    } catch (err: unknown) {
      this.errorMessage.set('No se pudo generar el código QR.');
      console.error(err);
    }
  }

  onUrlChange(newValue: string) {
    this.url.set(newValue);
    this.generateQr();
  }

  clear() {
    this.url.set('');
    this.qrDataUrl.set(null);
    this.errorMessage.set(null);
  }

  downloadQr() {
    const data = this.qrDataUrl();
    if (!data) return;

    let filename = 'codigo-qr.png';
    const text = this.url().trim();
    try {
      const parsed = new URL(text.startsWith('http') ? text : `https://${text}`);
      if (parsed.hostname) {
        const cleanHost = parsed.hostname.replace(/[^a-zA-Z0-9.-]/g, '_');
        filename = `qr_${cleanHost}.png`;
      }
    } catch {
      // default filename
    }

    const anchor = document.createElement('a');
    anchor.href = data;
    anchor.download = filename;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
  }
}
