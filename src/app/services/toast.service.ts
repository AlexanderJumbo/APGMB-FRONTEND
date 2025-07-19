import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ToastService {
    message = signal<string | null>(null);
    type = signal<'success' | 'error' | 'warning' | 'info'>('info');
    visible = signal(false);

    show(msg: string, type: 'success' | 'error' | 'warning' | 'info' = 'info') {
        this.message.set(msg);
        this.type.set(type);
        this.visible.set(true);

        setTimeout(() => this.visible.set(false), 4000);
    }
}