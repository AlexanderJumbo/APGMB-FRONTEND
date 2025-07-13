import { Component, ElementRef, HostListener, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { v4 as uuidv4 } from 'uuid';

interface Client {
  id: string;
  name: string;
  lastname: string;
  dni: string;
  number_phone: string;
  address: string;
}

@Component({
  selector: 'app-manage-client',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './manage-client.component.html',
})
export default class ManageClientComponent {
  private fb = new FormBuilder();

  constructor(private eRef: ElementRef) {
    this.clientes.set([
      {
        id: '1a2b3c',
        name: 'Juan',
        lastname: 'Pérez',
        dni: '0102030405',
        number_phone: '0987654321',
        address: 'Calle 123 y Av. Central',
      },
      {
        id: '2b3c4d',
        name: 'Ana',
        lastname: 'Torres',
        dni: '0607080910',
        number_phone: '0954321876',
        address: 'Cdla. Los Álamos',
      },
      {
        id: '3c4d5e',
        name: 'Carlos',
        lastname: 'Gómez',
        dni: '1102233445',
        number_phone: '0999988776',
        address: 'Av. Malecón 456',
      },
    ]);
  }

  clientes = signal<Client[]>([]);
  clienteSeleccionado = signal<Client | null>(null);
  mostrarModalAgregar = signal(false);
  mostrarModalEditar = signal(false);
  mostrarModalEliminar = signal(false);
  toastMensaje = signal('');
  mostrarToast = signal(false);
  menuAbierto = signal<string | null>(null);

  form = this.fb.group({
    name: ['', Validators.required],
    lastname: ['', Validators.required],
    dni: [
      '',
      [
        Validators.required,
        Validators.pattern('^[0-9]*$'),
        Validators.minLength(10),
        Validators.maxLength(10),
      ],
    ],
    number_phone: [
      '',
      [
        Validators.required,
        Validators.pattern('^[0-9]*$'),
        Validators.minLength(9),
        Validators.maxLength(10),
      ],
    ],
    address: ['', Validators.required],
  });

  abrirModalAgregar() {
    this.form.reset();
    this.mostrarModalAgregar.set(true);
  }

  abrirModalEditar(cliente: Client) {
    this.clienteSeleccionado.set(cliente);
    this.form.patchValue({
      name: cliente.name,
      lastname: cliente.lastname,
      dni: cliente.dni,
      number_phone: cliente.number_phone,
      address: cliente.address,
    });
    this.mostrarModalEditar.set(true);
  }

  confirmarEliminar(cliente: Client) {
    this.clienteSeleccionado.set(cliente);
    this.mostrarModalEliminar.set(true);
  }

  cerrarModal() {
    this.mostrarModalAgregar.set(false);
    this.mostrarModalEditar.set(false);
    this.mostrarModalEliminar.set(false);
    this.menuAbierto.set(null);
  }

  toggleMenu(id: string | null) {
    this.menuAbierto.update((current) => (current === id ? null : id));
  }

  crearCliente() {
    if (this.form.invalid) return;

    const nuevoCliente: Client = {
      id: uuidv4(),
      name: this.form.value.name!,
      lastname: this.form.value.lastname!,
      dni: this.form.value.dni!,
      number_phone: this.form.value.number_phone!,
      address: this.form.value.address!,
    };

    this.clientes.update((lista) => [...lista, nuevoCliente]);
    this.toastMensaje.set('Cliente creado exitosamente');
    this.mostrarToast.set(true);
    this.cerrarModal();
    setTimeout(() => this.mostrarToast.set(false), 3000);
  }

  actualizarCliente() {
    if (!this.clienteSeleccionado()) return;

    const actualizado: Client = {
      ...this.clienteSeleccionado()!,
      name: this.form.value.name!,
      lastname: this.form.value.lastname!,
      dni: this.form.value.dni!,
      number_phone: this.form.value.number_phone!,
      address: this.form.value.address!,
    };

    this.clientes.update((lista) =>
      lista.map((u) => (u.id === actualizado.id ? actualizado : u))
    );
    this.toastMensaje.set('Cliente actualizado');
    this.mostrarToast.set(true);
    this.cerrarModal();
    setTimeout(() => this.mostrarToast.set(false), 3000);
  }

  eliminarCliente() {
    if (!this.clienteSeleccionado()) return;

    const id = this.clienteSeleccionado()!.id;
    this.clientes.update((lista) => lista.filter((u) => u.id !== id));
    this.toastMensaje.set('Cliente eliminado');
    this.mostrarToast.set(true);
    this.cerrarModal();
    setTimeout(() => this.mostrarToast.set(false), 3000);
  }

  hasErrors(control: string, error: string) {
    const c = this.form.get(control);
    return c?.hasError(error) && c.touched;
  }

  trackById(index: number, item: Client) {
    return item.id;
  }
  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent) {
    if (!this.eRef.nativeElement.contains(event.target)) {
      this.menuAbierto.set(null);
    }
  }
}
