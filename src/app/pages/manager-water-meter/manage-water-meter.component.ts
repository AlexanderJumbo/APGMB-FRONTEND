import { CommonModule } from '@angular/common';
import {
  Component,
  ElementRef,
  HostListener,
  inject,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  GetAllWaterMeter,
  UpdatedWaterMeterRequest,
  WaterMeterRequest,
} from '../../models/waterModal';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-manage-water-meter',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './manage-water-meter.component.html',
})
export default class ManageWaterMeterComponent {
  private apiService = inject(ApiService);
  private eRef = inject(ElementRef);

  // Estado
  waterMeters = signal<GetAllWaterMeter[]>([]);
  selectedMeter = signal<GetAllWaterMeter | null>(null);

  mostrarModalAgregar = signal(false);
  mostrarModalEditar = signal(false);
  mostrarModalEliminar = signal(false);
  mostrarToast = signal(false);
  toastMensaje = signal('');
  menuAbierto = signal<number | null>(null);

  meter_mark = signal('');
  meter_number = signal('');

  constructor() {
    this.obtenerMedidores();
  }

  // Obtiene todos los medidores desde API
  obtenerMedidores() {
    this.apiService.getAllWaterMeters().subscribe({
      next: (res) => {
        this.waterMeters.set(res);
      },
      error: (err) => {
        console.error('Error al cargar medidores', err);
        this.mostrarToastConMensaje('Error al cargar medidores');
      },
    });
  }

  abrirModalAgregar() {
    this.selectedMeter.set(null);
    this.meter_mark.set('');
    this.meter_number.set('');
    this.mostrarModalAgregar.set(true);
  }

  abrirModalEditar(meter: GetAllWaterMeter) {
    this.selectedMeter.set(meter);
    this.meter_mark.set(meter.mark);
    this.meter_number.set(meter.serial);
    this.mostrarModalEditar.set(true);
  }

  confirmarEliminar(meter: GetAllWaterMeter) {
    this.selectedMeter.set(meter);
    this.mostrarModalEliminar.set(true);
  }

  cerrarModal() {
    this.mostrarModalAgregar.set(false);
    this.mostrarModalEditar.set(false);
    this.mostrarModalEliminar.set(false);
    this.menuAbierto.set(null);
    this.selectedMeter.set(null);
  }

  toggleMenu(id: number) {
    this.menuAbierto.update((current) => (current === id ? null : id));
  }

  crearMedidor() {
    const nuevo: WaterMeterRequest = {
      meterMark: this.meter_mark(),
      meterNumber: this.meter_number(),
      active: true,
      created_at: new Date(),
    };

    this.apiService.createWaterMeter(nuevo).subscribe({
      next: () => {
        this.mostrarToastConMensaje('Medidor creado exitosamente');
        this.obtenerMedidores();
        this.cerrarModal();
      },
      error: () => {
        this.mostrarToastConMensaje('Error al crear medidor');
      },
    });
  }

  actualizarMedidor() {
    const seleccionado = this.selectedMeter();
    if (!seleccionado) return;

    const actualizado: UpdatedWaterMeterRequest = {
      idMeter: seleccionado.meterId,
      markMeter: this.meter_mark(),
      numberMeter: this.meter_number(),
    };

    this.apiService.updateWaterMeter(actualizado).subscribe({
      next: () => {
        this.mostrarToastConMensaje('Medidor actualizado');
        this.obtenerMedidores();
        this.cerrarModal();
      },
      error: () => {
        this.mostrarToastConMensaje('Error al actualizar medidor');
      },
    });
  }

  eliminarMedidorConfirmado() {
    const seleccionado = this.selectedMeter();
    if (!seleccionado) return;


  }

  mostrarToastConMensaje(mensaje: string) {
    this.toastMensaje.set(mensaje);
    this.mostrarToast.set(true);
    setTimeout(() => this.mostrarToast.set(false), 3000);
  }

  trackById(index: number, item: GetAllWaterMeter) {
    return item.meterId;
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent) {
    if (!this.eRef.nativeElement.contains(event.target)) {
      this.menuAbierto.set(null);
    }
  }
}
