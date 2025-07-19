import { Component, inject } from '@angular/core';
import { ToastService } from '../../services/toast.service';
import { CommonModule } from '@angular/common';


@Component({
    imports: [CommonModule],
    selector: 'app-toast',
    standalone: true,
    templateUrl: './toast.component.html',
})
export class ToastComponent {
    toast = inject(ToastService);
}