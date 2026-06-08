import { Injectable, inject, signal, computed } from '@angular/core';
import { SucursalResumen } from '../models/auth.model';
import { StorageService } from './storage.service';

const SUCURSAL_KEY = 'opt_sucursal_id';

@Injectable({ providedIn: 'root' })
export class SucursalContextService {
  private readonly storage = inject(StorageService);

  readonly sucursales = signal<SucursalResumen[]>([]);
  readonly sucursalActual = signal<SucursalResumen | null>(null);
  readonly tieneMuchas = computed(() => this.sucursales().length > 1);

  init(sucursales: SucursalResumen[]): void {
    this.sucursales.set(sucursales);
    const storedId = this.storage.get(SUCURSAL_KEY);
    const encontrada = storedId
      ? (sucursales.find(s => s.sucursalId === storedId) ?? null)
      : null;
    this.sucursalActual.set(encontrada ?? sucursales[0] ?? null);
  }

  cambiar(sucursal: SucursalResumen): void {
    this.sucursalActual.set(sucursal);
    this.storage.set(SUCURSAL_KEY, sucursal.sucursalId);
  }

  clear(): void {
    this.sucursales.set([]);
    this.sucursalActual.set(null);
    this.storage.remove(SUCURSAL_KEY);
  }
}
