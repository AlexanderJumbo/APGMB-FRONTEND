import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { inject } from '@angular/core';
import { LectureResponse, UpdateLectureRequest } from '../../models/meterReading';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-reading-report',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: 'reading-report.component.html',
})
export default class ReadinngReportComponent {
  private apiService = inject(ApiService);

  fechaSeleccionada = signal<string>(this.getCurrentMonth());

  abrirCalendario = signal(false);
  lecturas = signal<LectureResponse[]>([]);
  lecturasModificadas = signal(false);

  // Checkboxes
  lecturasSeleccionadas = signal<number[]>([]);

  // Toast personalizado
  toastVisible = signal(false);
  toastMensaje = signal('');
  toastTipo = signal<'success' | 'warning' | 'error'>('success');

  constructor() {
    this.cargarLecturas();
  }

  cargarLecturas() {
    this.apiService.getAllLectures().subscribe((lecturas) => {
      this.lecturas.set(lecturas);
      this.lecturasModificadas.set(false);
      this.lecturasSeleccionadas.set([]);
    });
  }

  actualizarLectura(lectura: LectureResponse, event: Event) {
    const input = event.target as HTMLInputElement;
    const valorNum = Number(input.value);

    this.lecturasModificadas.set(true);

    this.lecturas.update((lista) => {
      const index = lista.findIndex((l) => l.idLecture === lectura.idLecture);
      if (index !== -1) {
        lista[index] = {
          ...lista[index],
          currentLecture: valorNum,
        };
      }
      return [...lista];
    });

    if ((isNaN(valorNum) || valorNum < lectura.prevLecture) && !this.toastVisible()) {
      this.mostrarToast('La lectura actual debe ser mayor o igual a la anterior.', 'warning');
    }
  }

  guardarCambios() {
    const lecturasParaActualizar = this.lecturas();
    const observables = lecturasParaActualizar.map((lectura) => {
      const updateData: UpdateLectureRequest = {
        idLecture: lectura.idLecture,
        currentLecture: lectura.currentLecture,
      };
      return this.apiService.updateLecture(updateData);
    });

    import('rxjs').then(({ forkJoin }) => {
      forkJoin(observables).subscribe({
        next: () => {
          this.lecturasModificadas.set(false);
          this.mostrarToast('Lecturas actualizadas correctamente.', 'success');
        },
        error: () => {
          this.mostrarToast('Error al actualizar las lecturas.', 'error');
        },
      });
    });
  }

  exportarPDF() {
    const idsSeleccionados = this.lecturasSeleccionadas();
    const lecturasSeleccionadas = this.lecturas().filter((l) =>
      idsSeleccionados.includes(l.idLecture)
    ).map(l => ({ idLecture: l.idLecture }));

    if (lecturasSeleccionadas.length === 0) {
      this.mostrarToast('Debe seleccionar al menos una lectura para exportar.', 'warning');
      return;
    }

    // Lógica simulada
    console.log('Exportando lecturas seleccionadas:', lecturasSeleccionadas);

    this.apiService.getPdf(lecturasSeleccionadas);

    this.mostrarToast('Lecturas seleccionadas exportadas a PDF.', 'success');
  }

  toggleCalendario() {
    this.abrirCalendario.update((v) => !v);
  }

  filtrarPorMes() {
    const mesFiltrado = this.fechaSeleccionada();

    this.apiService.getAllLectures().subscribe((todasLecturas) => {
      const filtradas = todasLecturas.filter((lectura) => {
        const fechaLectura = lectura.dateLecture?.slice(0, 7);
        return fechaLectura === mesFiltrado;
      });
      this.lecturas.set(filtradas);
      this.lecturasModificadas.set(false);
      this.lecturasSeleccionadas.set([]);
    });
  }

  onMesSeleccionado(event: Event) {
    const input = event.target as HTMLInputElement;
    const nuevoMes = input?.value;

    if (nuevoMes && nuevoMes !== this.fechaSeleccionada()) {
      this.fechaSeleccionada.set(nuevoMes);
      this.filtrarPorMes();
    }
  }

  get mesFormateado(): string {
    if (!this.fechaSeleccionada()) return '';
    const [year, month] = this.fechaSeleccionada().split('-');
    const meses = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
    ];
    const mesNombre = meses[parseInt(month, 10) - 1] || '';
    return `${mesNombre} ${year}`;
  }

  formatearFecha(fecha: string): string {
    const d = new Date(fecha);
    const opciones: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    return d.toLocaleDateString('es-ES', opciones);
  }

  calcularTotal(lectura: LectureResponse): number {
    return lectura.currentLecture - lectura.prevLecture;
  }

  // Selección de checkboxes
  toggleSeleccionarTodas(checked: boolean) {
    if (checked) {
      this.lecturasSeleccionadas.set(this.lecturas().map((l) => l.idLecture));
    } else {
      this.lecturasSeleccionadas.set([]);
    }
  }

  toggleSeleccionarUna(id: number, checked: boolean) {
    const actuales = this.lecturasSeleccionadas();
    if (checked) {
      this.lecturasSeleccionadas.set([...actuales, id]);
    } else {
      this.lecturasSeleccionadas.set(actuales.filter((i) => i !== id));
    }
  }

  estaSeleccionado(id: number): boolean {
    return this.lecturasSeleccionadas().includes(id);
  }

  todosSeleccionados(): boolean {
    return (
      this.lecturas().length > 0 &&
      this.lecturas().every((l) => this.estaSeleccionado(l.idLecture))
    );
  }

  // Función toast genérica
  mostrarToast(mensaje: string, tipo: 'success' | 'warning' | 'error' = 'success') {
    this.toastMensaje.set(mensaje);
    this.toastTipo.set(tipo);
    this.toastVisible.set(true);

    setTimeout(() => this.toastVisible.set(false), 4000);
  }
  toggleSeleccionarTodasDesdeEvento(event: Event) {
    const checked = (event.target as HTMLInputElement).checked;
    this.toggleSeleccionarTodas(checked);
  }

  toggleSeleccionarUnaDesdeEvento(idLecture: number, event: Event) {
    const checked = (event.target as HTMLInputElement).checked;
    this.toggleSeleccionarUna(idLecture, checked);
  }

  private getCurrentMonth(): string {
    const hoy = new Date();
    const m = hoy.getMonth() + 1;
    const mm = m < 10 ? `0${m}` : m.toString();
    return `${hoy.getFullYear()}-${mm}`;
  }
}
