import { Component, inject, signal, computed, OnInit, DestroyRef, effect, untracked } from '@angular/core';
import { DatePipe } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { StockService } from '../../../core/services/stock.service';
import { SucursalContextService } from '../../../core/services/sucursal-context.service';
import { StockDto, MovimientoStockDto, TIPOS_MOVIMIENTO } from '../../../core/models/stock.model';
import { MovimientoFormComponent } from '../movimiento-form/movimiento-form.component';
import { PrimerMovimientoFormComponent } from '../primer-movimiento-form/primer-movimiento-form.component';
import { DocumentoEntradaFormComponent } from '../documento-entrada-form/documento-entrada-form.component';
import { DocumentoStockService } from '../../../core/services/documento-stock.service';
import {
  DocumentoStockDto,
  TIPOS_DOCUMENTO_LABEL,
} from '../../../core/models/documento-stock.model';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-stock-list',
  standalone: true,
  imports: [DatePipe, MovimientoFormComponent, PrimerMovimientoFormComponent, DocumentoEntradaFormComponent],
  template: `
    <div class="p-6 lg:p-8 max-w-7xl mx-auto">

      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Stock</h1>
          <p class="text-sm text-gray-500 mt-0.5">
            Inventario de la sucursal {{ sucursalNombre() }}
          </p>
        </div>
        <button
          type="button"
          (click)="showNuevoMovimiento.set(true)"
          class="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white
                 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-xl transition-colors
                 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shrink-0"
        >
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
          </svg>
          Nuevo movimiento
        </button>
      </div>

      <!-- Tabs -->
      <div class="flex gap-1 border-b border-gray-100 mb-6">
        <button
          (click)="activeTab.set('stock')"
          class="px-4 py-2.5 text-sm font-medium rounded-t-lg transition-colors focus:outline-none"
          [class.bg-blue-50]="activeTab() === 'stock'"
          [class.text-blue-700]="activeTab() === 'stock'"
          [class.text-gray-500]="activeTab() !== 'stock'"
          [class.hover:text-gray-700]="activeTab() !== 'stock'"
        >
          Stock actual
          @if (stocks().length > 0) {
            <span class="ml-1.5 px-1.5 py-0.5 text-[10px] font-semibold rounded-full
                         bg-blue-100 text-blue-700">{{ stocks().length }}</span>
          }
          @if (bajoMinimoCount() > 0) {
            <span class="ml-1 px-1.5 py-0.5 text-[10px] font-semibold rounded-full
                         bg-red-100 text-red-700">{{ bajoMinimoCount() }} bajo mín.</span>
          }
        </button>
        <button
          (click)="onActivarEntradas()"
          class="px-4 py-2.5 text-sm font-medium rounded-t-lg transition-colors focus:outline-none"
          [class.bg-blue-50]="activeTab() === 'entradas'"
          [class.text-blue-700]="activeTab() === 'entradas'"
          [class.text-gray-500]="activeTab() !== 'entradas'"
          [class.hover:text-gray-700]="activeTab() !== 'entradas'"
        >
          Entradas
          @if (documentos().length > 0) {
            <span class="ml-1.5 px-1.5 py-0.5 text-[10px] font-semibold rounded-full
                         bg-gray-100 text-gray-500">{{ documentos().length }}</span>
          }
        </button>
        <button
          (click)="onActivarHistorial()"
          class="px-4 py-2.5 text-sm font-medium rounded-t-lg transition-colors focus:outline-none"
          [class.bg-blue-50]="activeTab() === 'historial'"
          [class.text-blue-700]="activeTab() === 'historial'"
          [class.text-gray-500]="activeTab() !== 'historial'"
          [class.hover:text-gray-700]="activeTab() !== 'historial'"
        >
          Historial de movimientos
        </button>
      </div>

      <!-- ══════════════════════ TAB STOCK ACTUAL ══════════════════════ -->
      @if (activeTab() === 'stock') {

        @if (loading()) {
          <div class="flex items-center justify-center py-24 gap-3">
            <svg class="w-5 h-5 animate-spin text-blue-600" fill="none" viewBox="0 0 24 24" aria-hidden="true">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
            </svg>
            <span class="text-sm text-gray-500">Cargando...</span>
          </div>
        }

        @if (!loading()) {

          @if (errorMessage()) {
            <div class="bg-red-50 border border-red-100 rounded-xl p-4 mb-4 flex items-center gap-3">
              <svg class="w-5 h-5 text-red-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              <p class="text-sm text-red-700">{{ errorMessage() }}</p>
            </div>
          }

          <div class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

            @if (stocks().length === 0) {
              <div class="flex flex-col items-center justify-center py-16 gap-3 text-center">
                <svg class="w-10 h-10 text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                    d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5
                       m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172
                       a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"/>
                </svg>
                <p class="text-sm font-medium text-gray-700">Sin registros de stock</p>
                <p class="text-xs text-gray-400">
                  Los registros se crean automáticamente al ingresar el primer movimiento.
                </p>
              </div>
            } @else {
              <div class="overflow-x-auto">
                <table class="w-full text-sm">
                  <thead>
                    <tr class="border-b border-gray-100 bg-gray-50/50">
                      <th class="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Producto / Variante
                      </th>
                      <th class="text-center px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Cantidad
                      </th>
                      <th class="text-center px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider
                                 hidden sm:table-cell">
                        Stock mínimo
                      </th>
                      <th class="text-center px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider
                                 hidden md:table-cell">
                        Estado
                      </th>
                      <th class="text-right px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-gray-50">
                    @for (s of stocks(); track s.stockId) {
                      <tr class="hover:bg-gray-50/50 transition-colors"
                          [class.bg-red-50]="s.bajoMinimo"
                          [class.hover:bg-red-50]="s.bajoMinimo">

                        <!-- Producto / Variante -->
                        <td class="px-5 py-3.5">
                          <p class="text-sm font-medium text-gray-900">{{ s.productoNombre }}</p>
                          <p class="text-xs text-gray-400 mt-0.5">{{ s.varianteNombre }}</p>
                        </td>

                        <!-- Cantidad -->
                        <td class="px-5 py-3.5 text-center">
                          <span
                            class="text-lg font-bold"
                            [class.text-red-600]="s.cantidadDisponible <= 0"
                            [class.text-amber-600]="s.bajoMinimo && s.cantidadDisponible > 0"
                            [class.text-gray-900]="!s.bajoMinimo && s.cantidadDisponible > 0"
                          >
                            {{ s.cantidadDisponible }}
                          </span>
                        </td>

                        <!-- Stock mínimo -->
                        <td class="px-5 py-3.5 text-center hidden sm:table-cell">
                          <span class="text-sm text-gray-500">{{ s.stockMinimo }}</span>
                        </td>

                        <!-- Estado -->
                        <td class="px-5 py-3.5 text-center hidden md:table-cell">
                          @if (s.cantidadDisponible <= 0) {
                            <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium
                                         bg-red-100 text-red-700 ring-1 ring-inset ring-red-200">
                              Sin stock
                            </span>
                          } @else if (s.bajoMinimo) {
                            <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium
                                         bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200">
                              <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                                <path fill-rule="evenodd"
                                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42
                                     c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3
                                     a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
                              </svg>
                              Bajo mínimo
                            </span>
                          } @else {
                            <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium
                                         bg-green-50 text-green-700 ring-1 ring-inset ring-green-200">
                              OK
                            </span>
                          }
                        </td>

                        <!-- Acciones -->
                        <td class="px-5 py-3.5 text-right">
                          <button
                            (click)="abrirMovimientoForm(s)"
                            class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-700
                                   bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors
                                   focus:outline-none focus:ring-2 focus:ring-blue-500"
                            [attr.aria-label]="'Registrar movimiento para ' + s.varianteNombre"
                          >
                            <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"/>
                            </svg>
                            Movimiento
                          </button>
                        </td>

                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            }
          </div>
        }
      }

      <!-- ══════════════════════ TAB ENTRADAS ══════════════════════════ -->
      @if (activeTab() === 'entradas') {

        <div class="flex justify-end mb-4">
          <button
            type="button"
            (click)="showDocumentoForm.set(true)"
            class="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white
                   bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-xl transition-colors
                   focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
            </svg>
            Nueva entrada
          </button>
        </div>

        @if (loadingDocumentos()) {
          <div class="flex items-center justify-center py-24 gap-3">
            <svg class="w-5 h-5 animate-spin text-blue-600" fill="none" viewBox="0 0 24 24" aria-hidden="true">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
            </svg>
            <span class="text-sm text-gray-500">Cargando entradas...</span>
          </div>
        }

        @if (!loadingDocumentos()) {
          @if (errorDocumentos()) {
            <div class="bg-red-50 border border-red-100 rounded-xl p-4 mb-4 flex items-center gap-3">
              <svg class="w-5 h-5 text-red-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              <p class="text-sm text-red-700">{{ errorDocumentos() }}</p>
            </div>
          }

          <div class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

            @if (documentos().length === 0) {
              <div class="flex flex-col items-center justify-center py-16 gap-3 text-center">
                <svg class="w-10 h-10 text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414
                       a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                </svg>
                <p class="text-sm font-medium text-gray-700">Sin documentos de entrada</p>
                <p class="text-xs text-gray-400">Haz clic en "Nueva entrada" para registrar una factura o boleta.</p>
              </div>
            } @else {
              <div class="overflow-x-auto">
                <table class="w-full text-sm">
                  <thead>
                    <tr class="border-b border-gray-100 bg-gray-50/50">
                      <th class="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Fecha
                      </th>
                      <th class="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Tipo
                      </th>
                      <th class="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Número
                      </th>
                      <th class="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider
                                 hidden md:table-cell">
                        Proveedor
                      </th>
                      <th class="text-center px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider
                                 hidden sm:table-cell">
                        Líneas
                      </th>
                      <th class="text-center px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Estado
                      </th>
                      <th class="text-right px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-gray-50">
                    @for (doc of documentos(); track doc.documentoId) {
                      <tr class="hover:bg-gray-50/50 transition-colors"
                          [class.opacity-60]="doc.estado === 'Anulado'">

                        <!-- Fecha -->
                        <td class="px-5 py-3.5">
                          <span class="text-xs font-mono text-gray-700">
                            {{ doc.fecha | date:'dd/MM/yyyy' }}
                          </span>
                        </td>

                        <!-- Tipo -->
                        <td class="px-5 py-3.5">
                          <span class="text-xs text-gray-600">{{ tipoDocumentoLabel(doc.tipoDocumento) }}</span>
                        </td>

                        <!-- Número -->
                        <td class="px-5 py-3.5">
                          <span class="text-sm font-medium font-mono text-gray-900">{{ doc.numeroDocumento }}</span>
                        </td>

                        <!-- Proveedor -->
                        <td class="px-5 py-3.5 hidden md:table-cell">
                          <span class="text-xs text-gray-500">{{ doc.proveedorNombre ?? '—' }}</span>
                        </td>

                        <!-- Líneas -->
                        <td class="px-5 py-3.5 text-center hidden sm:table-cell">
                          <span class="text-xs text-gray-500">{{ doc.lineas.length }}</span>
                        </td>

                        <!-- Estado -->
                        <td class="px-5 py-3.5 text-center">
                          @if (doc.estado === 'Confirmado') {
                            <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium
                                         bg-green-50 text-green-700 ring-1 ring-inset ring-green-200">
                              Confirmado
                            </span>
                          } @else {
                            <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium
                                         bg-red-50 text-red-700 ring-1 ring-inset ring-red-200">
                              Anulado
                            </span>
                          }
                        </td>

                        <!-- Acciones -->
                        <td class="px-5 py-3.5 text-right">
                          @if (doc.estado === 'Confirmado') {
                            <button
                              (click)="anularDocumento(doc)"
                              class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-600
                                     bg-red-50 hover:bg-red-100 rounded-lg transition-colors
                                     focus:outline-none focus:ring-2 focus:ring-red-500"
                              aria-label="Anular documento"
                            >
                              Anular
                            </button>
                          }
                        </td>

                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            }
          </div>
        }
      }

      <!-- ══════════════════════ TAB HISTORIAL ══════════════════════════ -->
      @if (activeTab() === 'historial') {

        <!-- Filtros -->
        <div class="flex flex-col sm:flex-row gap-3 mb-4">
          <select
            [value]="tipoFiltro()"
            (change)="tipoFiltro.set($any($event.target).value); cargarHistorial()"
            class="px-3.5 py-2.5 text-sm bg-white border border-gray-200 rounded-xl
                   hover:border-gray-300 transition-colors
                   focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Todos los tipos</option>
            @for (t of tipos; track t) {
              <option [value]="t">{{ t }}</option>
            }
          </select>
          <div class="flex items-center gap-2">
            <label for="hist-desde" class="text-sm text-gray-500 shrink-0">Desde</label>
            <input
              id="hist-desde"
              type="date"
              [value]="desdeFiltro()"
              (change)="desdeFiltro.set($any($event.target).value); cargarHistorial()"
              class="px-3.5 py-2.5 text-sm bg-white border border-gray-200 rounded-xl
                     hover:border-gray-300 transition-colors
                     focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div class="flex items-center gap-2">
            <label for="hist-hasta" class="text-sm text-gray-500 shrink-0">Hasta</label>
            <input
              id="hist-hasta"
              type="date"
              [value]="hastaFiltro()"
              (change)="hastaFiltro.set($any($event.target).value); cargarHistorial()"
              class="px-3.5 py-2.5 text-sm bg-white border border-gray-200 rounded-xl
                     hover:border-gray-300 transition-colors
                     focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          @if (tipoFiltro() || desdeFiltro() || hastaFiltro()) {
            <button
              (click)="limpiarFiltrosHistorial()"
              class="px-3.5 py-2.5 text-sm text-gray-500 bg-white border border-gray-200 rounded-xl
                     hover:border-gray-300 hover:text-gray-700 transition-colors
                     focus:outline-none focus:ring-2 focus:ring-gray-300"
            >
              Limpiar
            </button>
          }
        </div>

        @if (loadingHistorial()) {
          <div class="flex items-center justify-center py-24 gap-3">
            <svg class="w-5 h-5 animate-spin text-blue-600" fill="none" viewBox="0 0 24 24" aria-hidden="true">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
            </svg>
            <span class="text-sm text-gray-500">Cargando historial...</span>
          </div>
        }

        @if (!loadingHistorial()) {

          @if (errorHistorial()) {
            <div class="bg-red-50 border border-red-100 rounded-xl p-4 mb-4 flex items-center gap-3">
              <svg class="w-5 h-5 text-red-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              <p class="text-sm text-red-700">{{ errorHistorial() }}</p>
            </div>
          }

          <div class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

            @if (movimientos().length === 0) {
              <div class="flex flex-col items-center justify-center py-16 gap-3 text-center">
                <svg class="w-10 h-10 text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2
                       M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                </svg>
                <p class="text-sm font-medium text-gray-700">Sin movimientos</p>
                <p class="text-xs text-gray-400">
                  @if (tipoFiltro() || desdeFiltro() || hastaFiltro()) {
                    No hay movimientos con los filtros aplicados.
                  } @else {
                    Aún no se han registrado movimientos en esta sucursal.
                  }
                </p>
              </div>
            } @else {
              <div class="overflow-x-auto">
                <table class="w-full text-sm">
                  <thead>
                    <tr class="border-b border-gray-100 bg-gray-50/50">
                      <th class="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Fecha
                      </th>
                      <th class="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Tipo
                      </th>
                      <th class="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider
                                 hidden md:table-cell">
                        Variante
                      </th>
                      <th class="text-center px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Movimiento
                      </th>
                      <th class="text-center px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider
                                 hidden sm:table-cell">
                        Antes → Después
                      </th>
                      <th class="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider
                                 hidden lg:table-cell">
                        Referencia
                      </th>
                      <th class="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider
                                 hidden xl:table-cell">
                        Usuario
                      </th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-gray-50">
                    @for (m of movimientos(); track m.movimientoId) {
                      <tr class="hover:bg-gray-50/50 transition-colors">

                        <!-- Fecha -->
                        <td class="px-5 py-3.5">
                          <p class="text-sm text-gray-900 font-mono text-xs">
                            {{ m.fechaMovimiento | date:'dd/MM/yyyy' }}
                          </p>
                          <p class="text-xs text-gray-400 font-mono">
                            {{ m.fechaMovimiento | date:'HH:mm' }}
                          </p>
                        </td>

                        <!-- Tipo -->
                        <td class="px-5 py-3.5">
                          <span [class]="tipoBadgeClass(m.tipoMovimiento)"
                                class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ring-1 ring-inset">
                            {{ m.tipoMovimiento }}
                          </span>
                        </td>

                        <!-- Variante -->
                        <td class="px-5 py-3.5 hidden md:table-cell">
                          <p class="text-sm font-medium text-gray-900">{{ m.productoNombre }}</p>
                          <p class="text-xs text-gray-400 mt-0.5">{{ m.varianteNombre }}</p>
                        </td>

                        <!-- Movimiento (delta) -->
                        <td class="px-5 py-3.5 text-center">
                          <span
                            class="text-base font-bold font-mono"
                            [class]="deltaClass(m)"
                          >
                            {{ deltaDisplay(m) }}
                          </span>
                        </td>

                        <!-- Antes → Después -->
                        <td class="px-5 py-3.5 text-center hidden sm:table-cell">
                          <span class="text-xs font-mono text-gray-500">
                            {{ m.cantidadAntes }} → {{ m.cantidadDespues }}
                          </span>
                        </td>

                        <!-- Referencia -->
                        <td class="px-5 py-3.5 hidden lg:table-cell">
                          @if (m.referencia) {
                            <span class="text-xs font-mono text-gray-600 bg-gray-50 px-1.5 py-0.5 rounded">
                              {{ m.referencia }}
                            </span>
                          } @else {
                            <span class="text-xs text-gray-300">—</span>
                          }
                        </td>

                        <!-- Usuario -->
                        <td class="px-5 py-3.5 hidden xl:table-cell">
                          <span class="text-xs text-gray-500">{{ m.usuarioNombre ?? '—' }}</span>
                        </td>

                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            }
          </div>
        }
      }

    </div>

    <!-- Modal movimiento (fila existente) -->
    @if (showMovimientoForm()) {
      <app-movimiento-form
        [stock]="stockSeleccionado()"
        (saved)="onMovimientoSaved()"
        (cancelled)="cerrarMovimientoForm()"
      />
    }

    <!-- Modal primer movimiento (variante sin stock) -->
    @if (showNuevoMovimiento()) {
      <app-primer-movimiento-form
        [existingVarianteIds]="existingVarianteIds()"
        (saved)="onNuevoMovimientoSaved()"
        (cancelled)="showNuevoMovimiento.set(false)"
      />
    }

    <!-- Modal nueva entrada (documento) -->
    @if (showDocumentoForm()) {
      <app-documento-entrada-form
        (saved)="onDocumentoSaved()"
        (cancelled)="showDocumentoForm.set(false)"
      />
    }
  `,
})
export class StockListComponent {
  private readonly stockService = inject(StockService);
  private readonly documentoStockService = inject(DocumentoStockService);
  private readonly sucursalContext = inject(SucursalContextService);

  readonly tipos = TIPOS_MOVIMIENTO;
  readonly activeTab = signal<'stock' | 'entradas' | 'historial'>('stock');
  readonly tiposDocumentoLabel = TIPOS_DOCUMENTO_LABEL;

  // ── Stock actual ─────────────────────────────────────────────────────────────
  readonly stocks = signal<StockDto[]>([]);
  readonly loading = signal(true);
  readonly errorMessage = signal('');

  readonly bajoMinimoCount = computed(() => this.stocks().filter((s) => s.bajoMinimo).length);
  readonly sucursalNombre = computed(() => this.sucursalContext.sucursalActual()?.nombre ?? '');

  // ── Entradas (documentos) ─────────────────────────────────────────────────────
  readonly documentos = signal<DocumentoStockDto[]>([]);
  readonly loadingDocumentos = signal(false);
  readonly errorDocumentos = signal('');
  readonly showDocumentoForm = signal(false);

  // ── Historial ─────────────────────────────────────────────────────────────────
  readonly movimientos = signal<MovimientoStockDto[]>([]);
  readonly loadingHistorial = signal(false);
  readonly errorHistorial = signal('');
  readonly tipoFiltro = signal('');
  readonly desdeFiltro = signal('');
  readonly hastaFiltro = signal('');

  // ── Modales ───────────────────────────────────────────────────────────────────
  readonly showMovimientoForm = signal(false);
  readonly stockSeleccionado = signal<StockDto | null>(null);
  readonly showNuevoMovimiento = signal(false);
  readonly existingVarianteIds = computed(() => this.stocks().map(s => s.varianteId));

  constructor() {
    // Recargar cuando cambie la sucursal activa
    effect(() => {
      const sucursal = this.sucursalContext.sucursalActual();
      if (!sucursal) return;
      untracked(() => {
        this.cargarStock();
        this.documentos.set([]);
        this.movimientos.set([]);
      });
    });
  }

  cargarStock(): void {
    this.loading.set(true);
    this.errorMessage.set('');
    this.stockService.getStock().subscribe({
      next: (items) => {
        this.stocks.set(items);
        this.loading.set(false);
      },
      error: () => {
        this.errorMessage.set('Error al cargar el stock. Verifique la conexión.');
        this.loading.set(false);
      },
    });
  }

  cargarHistorial(): void {
    this.loadingHistorial.set(true);
    this.errorHistorial.set('');
    this.stockService
      .getHistorial({
        tipo: this.tipoFiltro() || undefined,
        desde: this.desdeFiltro() || undefined,
        hasta: this.hastaFiltro() || undefined,
      })
      .subscribe({
        next: (items) => {
          this.movimientos.set(items);
          this.loadingHistorial.set(false);
        },
        error: () => {
          this.errorHistorial.set('Error al cargar el historial. Verifique la conexión.');
          this.loadingHistorial.set(false);
        },
      });
  }

  // ── Entradas ──────────────────────────────────────────────────────────────────

  onActivarEntradas(): void {
    this.activeTab.set('entradas');
    if (this.documentos().length === 0 && !this.loadingDocumentos()) {
      this.cargarDocumentos();
    }
  }

  cargarDocumentos(): void {
    this.loadingDocumentos.set(true);
    this.errorDocumentos.set('');
    this.documentoStockService.getDocumentos().subscribe({
      next: res => {
        this.documentos.set(res.items);
        this.loadingDocumentos.set(false);
      },
      error: () => {
        this.errorDocumentos.set('Error al cargar los documentos. Verifique la conexión.');
        this.loadingDocumentos.set(false);
      },
    });
  }

  onDocumentoSaved(): void {
    this.showDocumentoForm.set(false);
    this.cargarDocumentos();
    this.cargarStock();
    this.movimientos.set([]);
  }

  anularDocumento(doc: DocumentoStockDto): void {
    Swal.fire({
      title: '¿Anular documento?',
      html: `Se generarán movimientos de compensación para <b>${doc.numeroDocumento}</b>.<br>Esta acción no se puede deshacer.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Sí, anular',
      cancelButtonText: 'Cancelar',
    }).then(result => {
      if (!result.isConfirmed) return;
      this.documentoStockService.anular(doc.documentoId).subscribe({
        next: () => {
          Swal.fire({
            icon: 'success',
            title: 'Documento anulado',
            timer: 1500,
            timerProgressBar: true,
            showConfirmButton: false,
          });
          this.cargarDocumentos();
          this.cargarStock();
          this.movimientos.set([]);
        },
        error: (err: { error?: { detail?: string } }) => {
          Swal.fire({
            icon: 'error',
            title: 'Error al anular',
            text: err.error?.detail ?? 'No se pudo anular el documento.',
            confirmButtonColor: '#2563eb',
          });
        },
      });
    });
  }

  tipoDocumentoLabel(tipo: string): string {
    return (this.tiposDocumentoLabel as Record<string, string>)[tipo] ?? tipo;
  }

  onActivarHistorial(): void {
    this.activeTab.set('historial');
    if (this.movimientos().length === 0 && !this.loadingHistorial()) {
      this.cargarHistorial();
    }
  }

  limpiarFiltrosHistorial(): void {
    this.tipoFiltro.set('');
    this.desdeFiltro.set('');
    this.hastaFiltro.set('');
    this.cargarHistorial();
  }

  // ── Modal ─────────────────────────────────────────────────────────────────────

  abrirMovimientoForm(s: StockDto): void {
    this.stockSeleccionado.set(s);
    this.showMovimientoForm.set(true);
  }

  cerrarMovimientoForm(): void {
    this.showMovimientoForm.set(false);
    this.stockSeleccionado.set(null);
  }

  onMovimientoSaved(): void {
    this.cerrarMovimientoForm();
    this.cargarStock();
    this.movimientos.set([]);
  }

  onNuevoMovimientoSaved(): void {
    this.showNuevoMovimiento.set(false);
    this.cargarStock();
    this.movimientos.set([]);
  }

  // ── Helpers de presentación ───────────────────────────────────────────────────

  deltaDisplay(m: MovimientoStockDto): string {
    switch (m.tipoMovimiento) {
      case 'Entrada': return `+${m.cantidad}`;
      case 'Salida':  return `-${m.cantidad}`;
      case 'Ajuste':  return m.cantidad > 0 ? `+${m.cantidad}` : `${m.cantidad}`;
      default:        return `${m.cantidad}`;
    }
  }

  deltaClass(m: MovimientoStockDto): string {
    switch (m.tipoMovimiento) {
      case 'Entrada': return 'text-green-600';
      case 'Salida':  return 'text-red-600';
      case 'Ajuste':  return m.cantidad >= 0 ? 'text-blue-600' : 'text-orange-600';
      default:        return 'text-gray-700';
    }
  }

  tipoBadgeClass(tipo: string): string {
    switch (tipo) {
      case 'Entrada': return 'bg-green-50 text-green-700 ring-green-200';
      case 'Salida':  return 'bg-red-50 text-red-700 ring-red-200';
      case 'Ajuste':  return 'bg-blue-50 text-blue-700 ring-blue-200';
      default:        return 'bg-gray-50 text-gray-500 ring-gray-200';
    }
  }
}
