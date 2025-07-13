import { CommonModule } from '@angular/common';
import {
  Component,
  ElementRef,
  HostListener,
  inject,
  signal,
  computed,
} from '@angular/core';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { GetAccountListResponse } from '../../models/accountModal';
import { Sector } from '../../models/sector';

@Component({
  selector: 'app-manage-account',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './manage-account.component.html',
})
export default class ManageAccountComponent {
  private apiService = inject(ApiService);
  private eRef = inject(ElementRef);
  private fb = new FormBuilder();
  filtroSector = signal<string>('');
  filtroActivo = signal<boolean | null>(null);
  sectores = signal<Sector[]>([]);
  cuentas = signal<GetAccountListResponse[]>([]);
  mostrarModalAgregar = signal(false);
  mostrarModalEditar = signal(false);
  mostrarModalEliminar = signal(false);
  mostrarToast = signal(false);
  toastMensaje = signal('');

  cuentaSeleccionada = signal<GetAccountListResponse | null>(null);
  menuAbierto = signal<number | null>(null);

  toastEsError = computed(() => {
    const msg = this.toastMensaje().toLowerCase();
    return msg.includes('error') || msg.includes('obligatorios');
  });

  form = this.fb.group({
    name: ['', Validators.required],
    lastname: ['', Validators.required],
    dni: ['', [Validators.required, Validators.pattern('^[0-9]*$'), Validators.minLength(10), Validators.maxLength(10)]],
    email: ['', [Validators.required, Validators.email]],
    address: ['', Validators.required],
    phoneNumber: ['', [Validators.required, Validators.pattern('^[0-9]*$')]],
    meterNumber: ['', Validators.required],
    meterMark: ['', Validators.required],
    predialCode: ['', Validators.required],
    nameSector: ['', Validators.required],
  });


  constructor() {
    this.obtenerSectores();
    this.obtenerCuentas();
  }
  obtenerSectores() {
    this.apiService.getAllSectors().subscribe({
      next: (sectores) => {
        // Aquí asignamos directamente el arreglo de sectores completo
        this.sectores.set(sectores);
      },
      error: (err) => {
        console.error('Error al obtener sectores', err);
        this.mostrarToastConMensaje('Error al obtener sectores');
      },
    });
  }

  onEstadoChange(event: Event) {
    const select = event.target as HTMLSelectElement;
    const value = select.value;
    this.filtroActivo.set(value === '' ? null : value === 'true');
    this.obtenerCuentas();
  }
  onSectorChange(event: Event) {
    const select = event.target as HTMLSelectElement | null;
    if (!select) return;
    console.log("SECTOR", select.value)
    const value = select.value;
    this.filtroSector.set(value === '' ? '' : value ?? "")
    this.obtenerCuentas();
    // lógica para manejar el valor
  }

  crearCuenta() {
    if (this.form.invalid) return;

    const nuevaCuenta = {
      name: this.form.value.name!,
      lastname: this.form.value.lastname!,
      dni: this.form.value.dni!,
      email: this.form.value.email!,
      address: this.form.value.address!,
      phone: this.form.value.phoneNumber!,
      meterNumber: this.form.value.meterNumber!,
      meterMark: this.form.value.meterMark!,
      predialCode: this.form.value.predialCode!,
      nameSector: this.form.value.nameSector!,
      role: 'CLIENT',
    };

    this.apiService.createAccount(nuevaCuenta).subscribe({
      next: () => {
        this.mostrarToastConMensaje('Cuenta registrada exitosamente');
        this.cerrarModal();
        this.obtenerCuentas();
      },
      error: (err) => {
        console.error('Error al crear cuenta:', err);
        this.mostrarToastConMensaje('Error al registrar cuenta');
      },
    });
  }


  obtenerCuentas() {
    const params: any = {};

    if (this.filtroActivo() !== null) {
      params.isActive = this.filtroActivo();
    }

    if (this.filtroSector().trim() !== '') {
      params.sector = this.filtroSector();
    }

    this.apiService.getAllAccounts(params).subscribe({
      next: (res) => {
        this.cuentas.set(res);
        this.mostrarToastConMensaje('Cuentas obtenidas correctamente');
      },
      error: (err) => {
        console.error('Error al obtener cuentas', err);
        this.mostrarToastConMensaje('Error al obtener cuentas');
      },
    });
  }




  abrirModalAgregar() {
    this.cuentaSeleccionada.set(null);
    this.form.reset();
    this.form.get('nameSector')?.enable();
    this.mostrarModalAgregar.set(true);
    this.cerrarMenu();
  }

  abrirModalEditar(cuenta: GetAccountListResponse) {
    this.cuentaSeleccionada.set(cuenta);

    this.form.patchValue({
      name: cuenta.name || '',
      lastname: cuenta.lastname || '',
      dni: cuenta.dni || '',
      email: cuenta.email || '',
      address: cuenta.address || '',
      phoneNumber: cuenta.phone || '',
      meterNumber: cuenta.meterNumber || '',
      meterMark: cuenta.meterMark || '',
      predialCode: cuenta.predialCode || '',
      nameSector: cuenta.nameSector || '',
    });

    this.form.get('nameSector')?.disable(); // Bloquear edición de sector en modificar

    this.mostrarModalEditar.set(true);
    this.cerrarMenu();
  }



  actualizarCuenta() {
    if (this.form.invalid || !this.cuentaSeleccionada()) return;

    const cuenta = this.cuentaSeleccionada();

    const cuentaActualizada = {
      accountId: cuenta!.accountId,
      userId: cuenta!.userId,
      meterId: cuenta!.meterId,
      name: this.form.value.name!,
      lastname: this.form.value.lastname!,
      dni: this.form.value.dni!,
      email: this.form.value.email!,
      address: this.form.value.address!,
      phone: this.form.value.phoneNumber!,
      meterNumber: this.form.value.meterNumber!,
      meterMark: this.form.value.meterMark!,
      predialCode: this.form.value.predialCode!,   // <- Aquí
      nameSector: this.form.value.nameSector!,     // <- Aquí
      role: 'CLIENT',
    };

    this.apiService.updateAccount(cuentaActualizada).subscribe({
      next: () => {
        this.mostrarToastConMensaje('Cuenta actualizada exitosamente');
        this.cerrarModal();
        this.obtenerCuentas();
      },
      error: (err) => {
        console.error('Error al actualizar cuenta:', err);
        this.mostrarToastConMensaje('Error al actualizar cuenta');
      },
    });
  }


  eliminarCuenta() {
    const cuenta = this.cuentaSeleccionada();
    if (!cuenta) return;

    console.log('Cuenta a eliminar:', cuenta);

    this.apiService.deleteAccount(cuenta.accountId).subscribe({
      next: () => {
        this.mostrarToastConMensaje('Cuenta desactivada exitosamente');
        this.obtenerCuentas();
        this.cerrarModal();
      },
      error: (err) => {
        console.error('Error al desactivar cuenta:', err);
        this.mostrarToastConMensaje('Error al desactivar cuenta');
      },
    });
  }

  confirmarEliminar(cuenta: GetAccountListResponse) {
    this.cuentaSeleccionada.set(cuenta);
    this.mostrarModalEliminar.set(true); // ✅ muestra modal eliminar
    this.cerrarMenu();
  }



  mostrarToastConMensaje(mensaje: string) {
    this.toastMensaje.set(mensaje);
    this.mostrarToast.set(true);
    setTimeout(() => this.mostrarToast.set(false), 3000);
  }

  trackById(index: number, item: GetAccountListResponse) {
    return item.accountId;
  }

  toggleMenu(accountId: number) {
    this.menuAbierto.set(this.menuAbierto() === accountId ? null : accountId);
  }

  cerrarMenu() {
    this.menuAbierto.set(null);
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent) {
    if (!this.eRef.nativeElement.contains(event.target)) {
      this.cerrarMenu();
    }
  }

  @HostListener('document:keydown.escape')
  onEscapeKey() {
    this.cerrarMenu();
    this.cerrarModal();
  }
  cerrarModal() {
    this.mostrarModalAgregar.set(false);
    this.mostrarModalEditar.set(false);
    this.mostrarModalEliminar.set(false);
  }



  cerrarMenuFuera(event: Event, id: number) {
    const target = event.target as HTMLElement;
    if (!target.closest('[aria-label="Mostrar opciones"]')) {
      this.menuAbierto.set(null);
    }
  }

  cerrarMenuEscape() {
    this.menuAbierto.set(null);
  }

}
