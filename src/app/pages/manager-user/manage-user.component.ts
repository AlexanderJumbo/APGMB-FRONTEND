import {
  Component,
  ElementRef,
  HostListener,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { v4 as uuidv4 } from 'uuid';
import { ApiService } from '../../services/api.service';
import { GetUserResponse, RegisterRequest } from '../../models/userModal';

@Component({
  selector: 'app-manage-user',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './manage-user.component.html',
})
export default class ManageUserComponent {
  private fb = new FormBuilder();
  private apiService = inject(ApiService);

  usuarios = signal<GetUserResponse[]>([]);
  roles = signal<string[]>([]);

  usuarioSeleccionado = signal<GetUserResponse | null>(null);
  toastEsError = signal(false);
  mostrarModalAgregar = signal(false);
  mostrarModalEditar = signal(false);
  mostrarModalEliminar = signal(false);
  toastMensaje = signal('');
  mostrarToast = signal(false);
  menuAbierto = signal<string | null>(null);

  private eRef = inject(ElementRef);

  constructor() {
    this.apiService.getRoles().subscribe((roles) => this.roles.set(roles));
    this.consultarUsuarios();
  }

  consultarUsuarios() {
    this.apiService.getAllUsers().subscribe({
      next: (usuarios) => {
        this.usuarios.set(usuarios);
        //this.mostrarToastConMensaje('Usuarios consultados correctamente')
      },
      error: (err) => {
        console.error(err);
        this.mostrarToastConMensaje('Error al consultar usuarios', true); // 🎯 error
      },
    });
  }

  form = this.fb.group(
    {
      firstname: ['', Validators.required],
      lastname: ['', Validators.required],
      username: ['', Validators.required],
      dni: [
        '',
        [
          Validators.pattern('^[0-9]*$'),
          Validators.minLength(10),
          Validators.maxLength(10),
        ],
      ],
      address: [''],
      numberPhone: [
        '',
        [
          Validators.pattern('^[0-9]*$'),
          Validators.minLength(9),
          Validators.maxLength(10),
        ],
      ],
      password: ['', [Validators.minLength(4)]], // ya no es required
      repeated_password: [''],                    // ya no es required
      role: ['', Validators.required],
    },
    {
      validators: (group) => {
        const pass = group.get('password')?.value;
        const repeat = group.get('repeated_password')?.value;
        // Validar solo si se ingresó algo
        if (pass || repeat) {
          return pass === repeat ? null : { passwordMismatch: true };
        }
        return null;
      },
    }
  );
  get isFormValidToSubmit(): boolean {
    if (this.mostrarModalAgregar()) {
      return this.form.valid;
    }
    // En modo editar permitimos enviar aunque no sea válido
    return true;
  }


  abrirModalAgregar() {
    this.form.reset();
    this.mostrarModalAgregar.set(true);
  }

  abrirModalEditar(user: GetUserResponse) {
    this.usuarioSeleccionado.set(user);

    this.form.patchValue({
      firstname: user.name,
      lastname: user.lastname,
      username: user.userName,
      dni: user.dni,
      address: user.address,
      numberPhone: user.numberPhone,
      password: '',  // vacío para que el usuario lo reingrese
      repeated_password: '',
      role: user.role,
    });
    this.mostrarModalEditar.set(true);
  }


  confirmarEliminar(user: GetUserResponse) {
    this.usuarioSeleccionado.set(user);
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

  crearUsuario() {
    if (this.form.invalid) return;

    const data: RegisterRequest = {
      name: this.form.value.firstname!,
      lastname: this.form.value.lastname!,
      userName: this.form.value.username!,
      dni: this.form.value.dni!,
      address: this.form.value.address!,
      numberPhone: this.form.value.numberPhone!,
      password: this.form.value.password!,
      repeated_password: this.form.value.repeated_password!,
      role: this.form.value.role!,
    };
    if (this.form.value.password && this.form.value.repeated_password) {
      data.password = this.form.value.password!;
      data.repeated_password = this.form.value.repeated_password!;
    }

    this.apiService.register(data).subscribe({
      next: (res) => {
        this.consultarUsuarios();
        this.mostrarToastConMensaje('Usuario creado exitosamente');
        this.cerrarModal();
      },
      error: (err) => {
        console.error(err);
        this.mostrarToastConMensaje('Error al registrar el usuario', true);
      },
    });
  }

  actualizarUsuario() {
    if (this.form.invalid || !this.usuarioSeleccionado()) return;

    const usuario = this.usuarioSeleccionado()!;

    const data: any = {
      userId: usuario.idUser,
      name: this.form.value.firstname!,
      lastname: this.form.value.lastname!,
      userName: this.form.value.username!,
      dni: this.form.value.dni!,
      email: usuario.email,
      address: this.form.value.address!,
      numberPhone: this.form.value.numberPhone!,
      role: this.form.value.role!,
      password: this.form.value.password ?? '',
      repeated_password: this.form.value.repeated_password ?? '',
    };

    this.apiService.updateUser(data).subscribe({
      next: () => {
        this.consultarUsuarios();
        this.mostrarToastConMensaje('Usuario actualizado exitosamente');
        this.cerrarModal();
      },
      error: (err) => {
        console.error(err);
        this.mostrarToastConMensaje('Error al actualizar el usuario', true);
      },
    });
  }



  eliminarUsuario() {
    const usuario = this.usuarioSeleccionado();
    if (!usuario) return;

    this.apiService.deleteUser(usuario.idUser).subscribe({
      next: (res) => {
        if (res) {
          this.consultarUsuarios();
          this.mostrarToastConMensaje('Usuario eliminado exitosamente');
        } else {
          this.mostrarToastConMensaje('No se pudo eliminar el usuario', true);
        }
        this.cerrarModal();
      },
      error: (err) => {
        console.error(err);
        this.mostrarToastConMensaje('Error al eliminar el usuario', true);
        this.cerrarModal();
      },
    });
  }


  mostrarToastConMensaje(mensaje: string, esError = false) {
    this.toastMensaje.set(mensaje);
    this.toastEsError.set(esError);
    this.mostrarToast.set(true);
    setTimeout(() => this.mostrarToast.set(false), 3000);
  }

  hasErrors(control: string, error: string) {
    const c = this.form.get(control);
    return c?.hasError(error) && c.touched;
  }

  passwordsDoNotMatch(): boolean {
    return this.form.hasError('passwordMismatch') && this.form.touched;
  }

  trackById(index: number, item: GetUserResponse) {
    return item.userName;
  }

  @HostListener('document:keydown.escape', ['$event'])
  onEscKeyPress(event: KeyboardEvent) {
    this.cerrarModal();
  }

}
