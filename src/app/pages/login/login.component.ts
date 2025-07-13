import { Component, inject, signal } from '@angular/core';
import {
  FormBuilder,
  Validators,
  ReactiveFormsModule,
  FormGroup,
} from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { CommonModule } from '@angular/common';
import { ToastrService } from 'ngx-toastr'; // Asegúrate de instalar ngx-toastr

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
})
export default class LoginPage {
  private router = inject(Router);
  private apiService = inject(ApiService);
  private formBuilder = inject(FormBuilder);
  public toast = inject(ToastrService);

  public loading = signal(false);

  public formLogin: FormGroup = this.formBuilder.group({
    username: ['', Validators.required],
    password: ['', Validators.required],
  });
  authenticate() {
    if (this.formLogin.invalid) return;

    this.loading.set(true);

    const credentials = this.formLogin.value;

    this.apiService.authenticate(credentials).subscribe({
      next: (data) => {
        this.loading.set(false);
        const { jwt, userId } = data;

        if (jwt) {
          const payload = JSON.parse(atob(jwt.split('.')[1]));
          const role = payload.role;

          if (role === 'ADMINISTRATOR') {
            // Guarda sesión solo si es ADMINISTRATOR
            this.apiService.setSession(jwt, userId, role);
            this.toast.success('Inicio de sesión exitoso');
            this.router.navigate(['/gestionar-usuario']);
          } else {
            // No guarda sesión, no redirige
            this.toast.error(
              'Acceso denegado. Solo administradores pueden ingresar al sistema web.'
            );
          }
        } else {
          this.toast.error('Credenciales incorrectas');
        }
      },
      error: (err) => {
        this.loading.set(false);
        if (err?.error?.code === 400) {
          this.toast.error('Cuenta bloqueada o credenciales incorrectas');
        } else {
          this.toast.error('Error desconocido');
        }
        console.error(err);
      },
    });
  }

  hasErrors(field: string, type: string) {
    const control = this.formLogin.get(field);
    return control?.hasError(type) && control?.touched;
  }
}
