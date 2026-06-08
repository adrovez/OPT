import { Injectable } from '@angular/core';

/**
 * Abstracción sobre localStorage.
 * DIP: los servicios dependen de esta interfaz, no de la API del navegador directamente.
 * Beneficio: testeable con spy/mock sin necesidad de DOM real.
 */
@Injectable({ providedIn: 'root' })
export class StorageService {
  get(key: string): string | null {
    return localStorage.getItem(key);
  }

  set(key: string, value: string): void {
    localStorage.setItem(key, value);
  }

  remove(key: string): void {
    localStorage.removeItem(key);
  }
}
