import { CommonModule } from '@angular/common';
import { Component, ChangeDetectionStrategy, signal, inject } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { LectureHistoryItem, LectureHistoryQueryParams } from '../../models/historical';

@Component({
  selector: 'app-historical',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './historical.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,

})
export default class HistoricalComponent {
  private apiService = inject(ApiService);

  lecturas = signal<LectureHistoryItem[]>([]);
  totalPaginas = signal(0);
  paginaActual = signal(0);

  fechaInicio = signal(this.primerDiaMarzo());
  fechaFin = signal(this.hoyISO());

  usuarioNombre = signal(''); // <-- ahora es string

  elementosPorPagina = signal(5);
  ordenCampo = 'id';
  ordenDireccion: 'asc' | 'desc' = 'asc';

  errorMsg = signal<string | null>(null);
  opcionesElementosPorPagina = [5, 10, 25, 50];

  constructor() {
    this.cargarLecturas();
  }
  primerDiaMarzo(): string {
    const fecha = new Date();
    return new Date(fecha.getFullYear(), 2, 1).toISOString().split('T')[0];
  }

  hoyISO(): string {
    return new Date().toISOString().split('T')[0];
  }

  cargarLecturas() {
    this.errorMsg.set(null);

    const sinFiltroFecha = !this.fechaInicio();
    const sinFiltroUsuario = !this.usuarioNombre().trim();

    const params: Partial<LectureHistoryQueryParams> = {
      f: this.ordenCampo,
      d: this.ordenDireccion,
      n: this.elementosPorPagina(),
      p: this.paginaActual(),
      ...(this.fechaInicio() && !sinFiltroFecha ? { startDate: this.fechaInicio() } : {}),
      ...(this.fechaFin() && !sinFiltroFecha ? { endDate: this.fechaFin() } : {}),
      ...(this.usuarioNombre() && !sinFiltroUsuario ? { user: this.usuarioNombre().trim() } : {})
    };

    this.apiService.getLectureHistory(params as LectureHistoryQueryParams).subscribe({
      next: (res) => {
        this.lecturas.set(res.content);
        this.totalPaginas.set(res.totalPages);
      },
      error: (err) => {
        this.errorMsg.set('Error al obtener el histórico de lecturas.');
        this.lecturas.set([]);
        this.totalPaginas.set(0);
        console.error(err);
      }
    });
  }

  aplicarFiltros() {
    this.paginaActual.set(0);
    this.cargarLecturas();
  }



  trackById(index: number, item: LectureHistoryItem) {
    return item.idLecture;
  }

  setFechaInicio(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.fechaInicio.set(value);
  }

  setFechaFin(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.fechaFin.set(value);
  }

  setUsuarioNombre(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.usuarioNombre.set(value);
  }

  totalPaginasArray() {
    return Array.from({ length: this.totalPaginas() }, (_, i) => i);
  }

  cambiarPagina(nuevaPagina: number) {
    if (nuevaPagina >= 0 && nuevaPagina < this.totalPaginas()) {
      this.paginaActual.set(nuevaPagina);
      this.cargarLecturas();
    }
  }

  setElementosPorPagina(n: number) {
    if (n !== this.elementosPorPagina()) {
      this.elementosPorPagina.set(n);
      this.paginaActual.set(0);
      this.cargarLecturas();
    }
  }
}
