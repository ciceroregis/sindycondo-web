import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class PushNotificationService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/push`;

  async init(): Promise<void> {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) return;

    try {
      const reg = await navigator.serviceWorker.register('/sw.js', { scope: '/' });
      await navigator.serviceWorker.ready;

      // Verifica permissão atual sem pedir de novo se já concedida
      let permission = Notification.permission;
      if (permission === 'default') {
        permission = await Notification.requestPermission();
      }
      if (permission !== 'granted') return;

      const keyRes = await this.http.get<{ public_key: string }>(`${this.base}/vapid-key/`).toPromise();
      if (!keyRes?.public_key) return;

      // Reutiliza subscrição existente ou cria uma nova
      let subscription = await reg.pushManager.getSubscription();
      if (!subscription) {
        subscription = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: this.urlBase64ToUint8Array(keyRes.public_key) as BufferSource,
        });
      }

      // Sempre persiste no backend (update_or_create — idempotente)
      const json = subscription.toJSON();
      await this.http.post(`${this.base}/subscribe/`, {
        endpoint: json.endpoint,
        p256dh: json.keys?.['p256dh'],
        auth: json.keys?.['auth'],
      }).toPromise();
    } catch (e) {
      console.warn('[Push] init error:', e);
    }
  }

  async unsubscribe(): Promise<void> {
    if (!('serviceWorker' in navigator)) return;
    try {
      const reg = await navigator.serviceWorker.getRegistration('/sw.js');
      const sub = await reg?.pushManager.getSubscription();
      if (!sub) return;

      await this.http.delete(`${this.base}/subscribe/`, {
        body: { endpoint: sub.endpoint },
      }).toPromise();
      await sub.unsubscribe();
    } catch (e) {
      console.warn('[Push] unsubscribe error:', e);
    }
  }

  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const raw = atob(base64);
    return Uint8Array.from(raw, c => c.charCodeAt(0));
  }
}
