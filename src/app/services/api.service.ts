import { HttpClient } from '@angular/common/http';
import { computed, effect, inject, Injectable, signal } from '@angular/core';
import { map, Observable, of } from 'rxjs';
import { GetUserResponse, RegisterRequest, RegisterResponse, UpdateUserRequest } from '../models/userModal';
import {
  GetAllWaterMeter,
  UpdatedWaterMeterRequest,
  UpdatedWaterMeterResponse,
  WaterMeterRequest,
  WaterMeterResponse,
} from '../models/waterModal';
import { AccountQueryParams, AccountRequest, AccountRequestUpdate, AccountResponse, GetAccountListResponse } from '../models/accountModal';
import { LectureResponse, UpdateLectureRequest } from '../models/meterReading';
import { LectureHistoryQueryParams, LectureHistoryResponse } from '../models/historical';
import { Sector } from '../models/sector';

const TOKEN_KEY = 'token';
const USER_KEY = 'user';
const ROLE_KEY = 'role'; // Nuevo

@Injectable({ providedIn: 'root' })
export class ApiService {
  private http = inject(HttpClient);

  private backendUrl = 'http://localhost:9191';

  // SIGNALS
  private tokenSignal = signal<string | null>(localStorage.getItem(TOKEN_KEY));
  private userIdSignal = signal<string | null>(localStorage.getItem(USER_KEY));
  private roleSignal = signal<string | null>(localStorage.getItem(ROLE_KEY)); // Nuevo

  // Estado de autenticación
  _isAuthenticated = computed(() => {
    const token = this.tokenSignal();
    return !!token && this.isValidateToken(token);
  });

  // Guardar en localStorage cuando cambien signals
  saveSessionToLocalStorage = effect(() => {
    const token = this.tokenSignal();
    const user = this.userIdSignal();
    const role = this.roleSignal();

    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);

    if (user) localStorage.setItem(USER_KEY, user);
    else localStorage.removeItem(USER_KEY);

    if (role) localStorage.setItem(ROLE_KEY, role);
    else localStorage.removeItem(ROLE_KEY);
  });

  // Autenticación
  authenticate(credentials: {
    username: string;
    password: string;
  }): Observable<any> {
    return this.http.post(
      `${this.backendUrl}/api/auth/authenticate`,
      credentials
    );
  }

  validateToken(token: string): Observable<Boolean> {
    return this.http.get<Boolean>(`${this.backendUrl}/api/auth/validate-token?jwt=${this.tokenSignal()}`)
  }

  // Establecer token, usuario y rol tras login exitoso
  setSession(jwt: string, userId: string, role: string) {
    this.tokenSignal.set(jwt);
    this.userIdSignal.set(userId);
    this.roleSignal.set(role); // Nuevo
  }

  clearSession() {
    this.tokenSignal.set(null);
    this.userIdSignal.set(null);
    localStorage.removeItem('role');
  }

  // Verificar si es admin usando el rol
  isAdmin(): boolean {
    const jwt = localStorage.getItem('token');
    if (!jwt) return false;

    try {
      const payload = JSON.parse(atob(jwt.split('.')[1]));
      return payload.role === 'ADMINISTRATOR'; // Asegúrate de usar el nombre exacto del backend
    } catch (e) {
      return false;
    }
  }

  isValidateToken(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expirationDate = payload.exp * 1000;
      return Date.now() < expirationDate;
    } catch (err) {
      return false;
    }
  }


  //Crear cuenta 
  createAccount(account: AccountRequest): Observable<AccountResponse> {
    return this.http.post<AccountResponse>(
      `${this.backendUrl}/api/account`,
      account
    );

  }
  // Actualizar cuenta
  updateAccount(account: AccountRequestUpdate) {
    return this.http.put<AccountResponse>(`${this.backendUrl}/api/account/update`, account);
  }

  // Eliminar cuenta de forma lógica
  deleteAccount(accountId: number) {
    return this.http.put<void>(`${this.backendUrl}/api/account/delete/${accountId}`, {});
  }

  getAllUsers(): Observable<GetUserResponse[]> {
    return this.http.get<GetUserResponse[]>(
      `${this.backendUrl}/api/user/all`
    );
  }

  getAllAccounts(params?: AccountQueryParams): Observable<GetAccountListResponse[]> {
    const queryParams = new URLSearchParams();

    if (params?.isActive !== undefined) {
      queryParams.set('isActive', params.isActive.toString());
    }

    if (params?.sector) {
      queryParams.set('sector', params.sector);
    }

    const url = `${this.backendUrl}/api/account/all?${queryParams.toString()}`;

    return this.http.get<GetAccountListResponse[]>(url).pipe(
      map((accounts) =>
        accounts.map((account) => ({
          ...account,
          dateRegister: account.dateRegister ? new Date(account.dateRegister) : null,
        }))
      )
    );
  }
  getAllSectors(): Observable<Sector[]> {
    return this.http.get<Sector[]>(`${this.backendUrl}/api/sector/all`);
  }



  register(user: RegisterRequest): Observable<RegisterResponse> {
    return this.http.post<RegisterResponse>(
      `${this.backendUrl}/api/user/register`,
      user
    );
  }
  updateUser(user: UpdateUserRequest): Observable<RegisterResponse> {
    return this.http.put<RegisterResponse>(
      `${this.backendUrl}/api/user/update`,
      user
    );
  }

  deleteUser(userId: number): Observable<Boolean> {
    return this.http.put<Boolean>(`${this.backendUrl}/api/user/delete/${userId}`, {});
  }


  getRoles(): Observable<string[]> {
    return of(['ADMINISTRATOR', 'OPERATIONAL']);
  }
  getAllWaterMeters(): Observable<GetAllWaterMeter[]> {
    return this.http.get<GetAllWaterMeter[]>(`${this.backendUrl}/api/meter`);
  }
  createWaterMeter(meter: WaterMeterRequest): Observable<WaterMeterResponse> {
    return this.http.post<WaterMeterResponse>(
      `${this.backendUrl}/api/meter`,
      meter
    );
  }
  updateWaterMeter(
    meter: UpdatedWaterMeterRequest
  ): Observable<UpdatedWaterMeterResponse> {
    return this.http.put<UpdatedWaterMeterResponse>(
      `${this.backendUrl}/api/meter/update`,
      meter
    );
  }

  getAllLectures(): Observable<LectureResponse[]> {
    return this.http.get<LectureResponse[]>(`${this.backendUrl}/api/lecture/all`);
  }
  updateLecture(lecture: UpdateLectureRequest): Observable<LectureResponse> {
    return this.http.put<LectureResponse>(`${this.backendUrl}/api/lecture/update`, lecture);
  }

  getLectureHistory(params: LectureHistoryQueryParams): Observable<LectureHistoryResponse> {
    const queryParams = new URLSearchParams();

    queryParams.set('f', params.f);
    queryParams.set('d', params.d);
    queryParams.set('n', params.n.toString());
    queryParams.set('p', params.p.toString());

    // Solo agrega si existen
    if (params.startDate) queryParams.set('startDate', params.startDate);
    if (params.endDate) queryParams.set('endDate', params.endDate);
    if (params.user) queryParams.set('user', params.user); // ya es string

    return this.http.get<LectureHistoryResponse>(
      `${this.backendUrl}/api/lecture/all/v2?${queryParams.toString()}`
    );
  }

  getPdf(ids: { idLecture: number }[]): void {
    this.http.post(`${this.backendUrl}/api/pdf/export`, ids, {
      responseType: 'blob'
    }).subscribe(blob => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'reporte.pdf';
      a.click();
      window.URL.revokeObjectURL(url);
    }, error => {
      console.error('Error al generar PDF:', error);
    });
  }

}
