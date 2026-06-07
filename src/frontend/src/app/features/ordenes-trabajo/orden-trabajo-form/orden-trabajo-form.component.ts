import {
  Component,
  inject,
  signal,
  computed,
  DestroyRef,
  OnInit,
} from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { firstValueFrom, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';

import { OrdenTrabajoService } from '../../../core/services/orden-trabajo.service';
import { ClienteService } from '../../../core/services/cliente.service';
import { ProductoService } from '../../../core/services/producto.service';
import { ProductoCategoriaService } from '../../../core/services/producto-categoria.service';
import { FormaPagoService } from '../../../core/services/forma-pago.service';
import { RecetaCristalesService } from '../../../core/services/receta-cristales.service';
import {
  TIPOS_FACTURACION,
  CreateOrdenTrabajoRequest,
  UpdateOrdenTrabajoRequest,
} from '../../../core/models/orden-trabajo.model';
import { Cliente, CreateClienteDto } from '../../../core/models/cliente.model';
import { ProductoDto, CategoriaDto } from '../../../core/models/producto.model';
import { FormaPagoDto } from '../../../core/models/forma-pago.model';
import { RecetaCristalesDto, CreateRecetaCristalesRequest, UpdateRecetaCristalesRequest } from '../../../core/models/receta-cristales.model';
import { RegionService } from '../../../core/services/region.service';
import { RegionWithComunas } from '../../../core/models/region.model';
import { PrevisionService, TipoPrevisionDto } from '../../../core/services/prevision.service';
import Swal from 'sweetalert2';

// ─── Local interfaces ─────────────────────────────────────────────────────────

interface RecetaForm {
  cristalesLaboratorio: boolean;
  urgente: boolean;
  incluirLejos: boolean;
  incluirCerca: boolean;
  lejosODEsferico: string;
  lejosODCilindro: string;
  lejosODEje: string;
  lejosODObservacion: string;
  lejosOIEsferico: string;
  lejosOICilindro: string;
  lejosOIEje: string;
  lejosOIObservacion: string;
  lejosDPEsferico: string;
  lejosDPObservacion: string;
  lejosADDEsfera: string;
  cercaODEsferico: string;
  cercaODCilindro: string;
  cercaODEje: string;
  cercaODObservacion: string;
  cercaOIEsferico: string;
  cercaOICilindro: string;
  cercaOIEje: string;
  cercaOIObservacion: string;
  cercaDPEsferico: string;
  cercaDPObservacion: string;
}

interface LineaForm {
  productoId: string;
  productoNombre: string;
  cantidad: number;
  valorUnitario: number;
  comentario: string;
}

interface AbonoForm {
  formaPagoId: number;
  formaPagoDescripcion: string;
  monto: number;
}

function emptyReceta(): RecetaForm {
  return {
    cristalesLaboratorio: false,
    urgente: false,
    incluirLejos: true,
    incluirCerca: false,
    lejosODEsferico: '', lejosODCilindro: '', lejosODEje: '', lejosODObservacion: '',
    lejosOIEsferico: '', lejosOICilindro: '', lejosOIEje: '', lejosOIObservacion: '',
    lejosDPEsferico: '', lejosDPObservacion: '', lejosADDEsfera: '',
    cercaODEsferico: '', cercaODCilindro: '', cercaODEje: '', cercaODObservacion: '',
    cercaOIEsferico: '', cercaOICilindro: '', cercaOIEje: '', cercaOIObservacion: '',
    cercaDPEsferico: '', cercaDPObservacion: '',
  };
}

// ─── Component ────────────────────────────────────────────────────────────────

@Component({
  selector: 'app-orden-trabajo-form',
  standalone: true,
  imports: [CurrencyPipe, DatePipe],
  template: `
    <div class="p-6 max-w-5xl mx-auto" style="background: #F3F6FA; min-height: 100%">

      <!-- Page header -->
      <div class="flex items-center gap-3 mb-6">
        <button
          type="button"
          (click)="volver()"
          class="p-2 rounded-lg text-gray-500 hover:bg-white hover:text-gray-700 transition-colors"
        >
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
          </svg>
        </button>
        <div>
          <h1 class="text-2xl font-bold" style="color: #0D1B3D">
            {{ modoEdicion() ? 'Editar Orden de Trabajo' : 'Nueva Orden de Trabajo' }}
          </h1>
          @if (modoEdicion()) {
            <p class="text-sm text-gray-500 mt-0.5">Editando OT #{{ numeroOT() }}</p>
          }
        </div>
      </div>

      @if (cargandoDetalle()) {
        <div class="flex items-center justify-center py-20">
          <div class="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
        </div>
      } @else {

        <!-- ── Header card (always visible) ────────────────────────────────── -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-5 mb-4">
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4">

            <!-- N° OT -->
            <div>
              <label class="block text-xs font-medium text-gray-500 mb-1">N° OT *</label>
              <div class="relative">
                <input
                  type="text"
                  [value]="numeroOT()"
                  (input)="onNumeroOTChange(getInputValue($event))"
                  maxlength="20"
                  placeholder="Ej: OT-001"
                  class="w-full px-3 py-2 pr-8 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  [class.border-red-400]="numeroOTDisponible() === false"
                  [class.border-green-400]="numeroOTDisponible() === true"
                  [class.border-gray-200]="numeroOTDisponible() === null"
                />
                @if (verificandoNumero()) {
                  <span class="absolute right-2.5 top-2.5">
                    <div class="w-4 h-4 border-2 border-blue-300 border-t-blue-600 rounded-full animate-spin"></div>
                  </span>
                } @else if (numeroOTDisponible() === true) {
                  <span class="absolute right-2.5 top-2.5 text-green-500 text-sm font-bold">✓</span>
                } @else if (numeroOTDisponible() === false) {
                  <span class="absolute right-2.5 top-2.5 text-red-500 text-sm font-bold">✗</span>
                }
              </div>
              @if (numeroOTDisponible() === false) {
                <p class="text-xs text-red-500 mt-1">Número ya en uso</p>
              }
            </div>

            <!-- Fecha Ingreso (readonly) -->
            <div>
              <label class="block text-xs font-medium text-gray-500 mb-1">Fecha Ingreso</label>
              <input
                type="text"
                [value]="fechaHoy | date:'dd/MM/yyyy'"
                readonly
                class="w-full px-3 py-2 rounded-lg border border-gray-100 bg-gray-50 text-sm text-gray-500 cursor-default"
              />
            </div>

            <!-- Fecha Entrega -->
            <div>
              <label class="block text-xs font-medium text-gray-500 mb-1">Fecha Entrega *</label>
              <input
                type="date"
                [value]="fechaEntrega()"
                (input)="fechaEntrega.set(getInputValue($event))"
                class="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <!-- Hora Entrega -->
            <div>
              <label class="block text-xs font-medium text-gray-500 mb-1">Hora Entrega</label>
              <input
                type="time"
                [value]="horaEntrega()"
                (input)="horaEntrega.set(getInputValue($event))"
                class="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <!-- Beneficiario -->
            <div>
              <label class="block text-xs font-medium text-gray-500 mb-1">Beneficiario</label>
              <input
                type="text"
                [value]="beneficiario()"
                (input)="beneficiario.set(getInputValue($event))"
                placeholder="Nombre beneficiario..."
                class="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <!-- Tipo Facturación -->
            <div class="col-span-2 md:col-span-1">
              <label class="block text-xs font-medium text-gray-500 mb-1">Empresa</label>
              <div class="flex gap-2">
                @for (tipo of tiposFacturacion; track tipo) {
                  <button
                    type="button"
                    (click)="tipoFacturacion.set(tipo)"
                    class="flex-1 py-2 rounded-lg border text-xs font-medium transition-colors"
                    [class.border-blue-500]="tipoFacturacion() === tipo"
                    [class.bg-blue-50]="tipoFacturacion() === tipo"
                    [class.text-blue-700]="tipoFacturacion() === tipo"
                    [class.border-gray-200]="tipoFacturacion() !== tipo"
                    [class.text-gray-600]="tipoFacturacion() !== tipo"
                  >{{ tipo }}</button>
                }
              </div>
            </div>

            <!-- Empresa Cliente (solo si tipo = Empresa) -->
            @if (tipoFacturacion() === 'Empresa') {
              <div class="relative col-span-2">
                <label class="block text-xs font-medium text-gray-500 mb-1">Empresa Cliente</label>
                <input
                  type="text"
                  [value]="empresaBusqueda()"
                  (input)="onEmpresaBusquedaChange(getInputValue($event))"
                  (focus)="empresaDropdownAbierto.set(true)"
                  placeholder="Buscar empresa..."
                  class="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                @if (empresaDropdownAbierto() && resultadosEmpresa().length > 0) {
                  <div class="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-40 overflow-y-auto">
                    @for (c of resultadosEmpresa(); track c.clienteId) {
                      <button
                        type="button"
                        (click)="seleccionarEmpresa(c)"
                        class="w-full text-left px-3 py-2 text-sm hover:bg-blue-50 transition-colors"
                      >
                        <span class="font-medium text-gray-900">{{ c.nombre }}</span>
                        <span class="text-gray-400 ml-2 text-xs">{{ c.numeroDocumento }}</span>
                      </button>
                    }
                  </div>
                }
                @if (empresaClienteId()) {
                  <p class="text-xs text-green-600 mt-0.5">Empresa seleccionada</p>
                }
              </div>
            }

          </div>
        </div>

        <!-- ── Tab navigation ───────────────────────────────────────────────── -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">

          <!-- Tab bar -->
          <div class="flex border-b border-gray-100">
            @for (tab of tabsDisponibles(); track $index; let i = $index) {
              <button
                type="button"
                (click)="irATab(i)"
                class="flex-1 py-3 text-sm font-medium transition-colors relative"
                [class.text-blue-600]="tabActual() === i"
                [class.text-gray-500]="tabActual() !== i"
                [class.cursor-pointer]="i <= tabActual()"
                [class.cursor-default]="i > tabActual()"
              >
                <span class="flex items-center justify-center gap-1.5">
                  <span
                    class="w-5 h-5 rounded-full text-xs flex items-center justify-center font-semibold"
                    [class.bg-blue-600]="tabActual() === i"
                    [class.text-white]="tabActual() === i"
                    [class.bg-gray-100]="tabActual() !== i"
                    [class.text-gray-500]="tabActual() !== i"
                  >{{ i + 1 }}</span>
                  {{ tab }}
                </span>
                @if (tabActual() === i) {
                  <span class="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-t"></span>
                }
              </button>
            }
          </div>

          <!-- ── Tab 0: Cliente ─────────────────────────────────────────────── -->
          @if (tabActual() === 0) {
            <div class="p-6">

              <!-- Tipo documento radios -->
              <div class="flex gap-4 mb-4">
                <label class="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="tipoDoc"
                    value="RUT"
                    [checked]="tipoDocumento() === 'RUT'"
                    (change)="tipoDocumento.set('RUT')"
                    class="accent-blue-600"
                  />
                  <span class="text-sm font-medium text-gray-700">RUT</span>
                </label>
                <label class="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="tipoDoc"
                    value="Otro"
                    [checked]="tipoDocumento() === 'Otro'"
                    (change)="tipoDocumento.set('Otro')"
                    class="accent-blue-600"
                  />
                  <span class="text-sm font-medium text-gray-700">Otro Documento</span>
                </label>
              </div>

              <!-- Buscar campo -->
              <div class="flex gap-2 mb-5">
                <input
                  type="text"
                  [value]="numeroDocumento()"
                  (input)="numeroDocumento.set(getInputValue($event))"
                  [placeholder]="tipoDocumento() === 'RUT' ? 'Ej: 12345678-9' : 'Número de documento'"
                  class="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="button"
                  (click)="buscarCliente()"
                  [disabled]="buscandoCliente() || !numeroDocumento().trim()"
                  class="px-4 py-2 rounded-lg text-sm font-medium text-white flex items-center gap-2 transition-colors disabled:opacity-50"
                  style="background: #2563EB"
                >
                  @if (buscandoCliente()) {
                    <div class="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin"></div>
                    Buscando...
                  } @else {
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0"/>
                    </svg>
                    Buscar
                  }
                </button>
              </div>

              <!-- Cliente encontrado -->
              @if (clienteEncontrado()) {
                <div class="rounded-lg border border-green-200 bg-green-50 p-4 mb-4">
                  <div class="flex items-center gap-2 mb-3">
                    <svg class="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0"/>
                    </svg>
                    <span class="text-sm font-semibold text-green-700">Cliente encontrado</span>
                  </div>
                  <div class="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                    <div>
                      <span class="text-xs text-gray-500">Nombre</span>
                      <p class="font-medium text-gray-800">{{ clienteEncontrado()!.nombre }}</p>
                    </div>
                    @if (clienteEncontrado()!.fechaNacimiento) {
                      <div>
                        <span class="text-xs text-gray-500">F. Nacimiento</span>
                        <p class="font-medium text-gray-800">{{ clienteEncontrado()!.fechaNacimiento | date:'dd/MM/yyyy' }}</p>
                      </div>
                    }
                    @if (clienteEncontrado()!.tipoPrevision) {
                      <div>
                        <span class="text-xs text-gray-500">Previsión</span>
                        <p class="font-medium text-gray-800">{{ clienteEncontrado()!.tipoPrevision }}</p>
                      </div>
                    }
                    @if (clienteEncontrado()!.celular) {
                      <div>
                        <span class="text-xs text-gray-500">Celular</span>
                        <p class="font-medium text-gray-800">{{ clienteEncontrado()!.celular }}</p>
                      </div>
                    }
                    @if (clienteEncontrado()!.mail) {
                      <div>
                        <span class="text-xs text-gray-500">Mail</span>
                        <p class="font-medium text-gray-800">{{ clienteEncontrado()!.mail }}</p>
                      </div>
                    }
                    @if (clienteEncontrado()!.direccion) {
                      <div class="col-span-2 md:col-span-3">
                        <span class="text-xs text-gray-500">Dirección</span>
                        <p class="font-medium text-gray-800">{{ clienteEncontrado()!.direccion }}</p>
                      </div>
                    }
                  </div>
                </div>
              }

              <!-- Cliente no encontrado: formulario nuevo -->
              @if (clienteNoEncontrado()) {
                <div class="rounded-lg border border-orange-200 bg-orange-50 p-4 mb-4">
                  <p class="text-sm font-semibold text-orange-700 mb-4">
                    Cliente no encontrado. Ingrese los datos:
                  </p>
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">

                    <div>
                      <label class="block text-xs font-medium text-gray-500 mb-1">Nombre *</label>
                      <input
                        type="text"
                        [value]="nuevoNombre()"
                        (input)="nuevoNombre.set(getInputValue($event))"
                        placeholder="Nombre completo"
                        class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label class="block text-xs font-medium text-gray-500 mb-1">F. Nacimiento</label>
                      <input
                        type="date"
                        [value]="nuevoFechaNacimiento()"
                        (input)="nuevoFechaNacimiento.set(getInputValue($event))"
                        class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label class="block text-xs font-medium text-gray-500 mb-1">Previsión</label>
                      <select
                        [value]="nuevoPrevision()"
                        (change)="nuevoPrevision.set(getInputValue($event))"
                        class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                      >
                        <option value="">Seleccionar...</option>
                        @for (tp of tiposPrevisiones(); track tp.idTipoPrevision) {
                          <option [value]="tp.descripcion">{{ tp.descripcion }}</option>
                        }
                      </select>
                    </div>

                    <div>
                      <label class="block text-xs font-medium text-gray-500 mb-1">Celular</label>
                      <input
                        type="text"
                        [value]="nuevoCelular()"
                        (input)="nuevoCelular.set(getInputValue($event))"
                        placeholder="+56 9 XXXX XXXX"
                        class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label class="block text-xs font-medium text-gray-500 mb-1">Mail</label>
                      <input
                        type="email"
                        [value]="nuevoMail()"
                        (input)="nuevoMail.set(getInputValue($event))"
                        placeholder="correo@ejemplo.cl"
                        class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label class="block text-xs font-medium text-gray-500 mb-1">Dirección</label>
                      <input
                        type="text"
                        [value]="nuevoDireccion()"
                        (input)="nuevoDireccion.set(getInputValue($event))"
                        placeholder="Calle, número..."
                        class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label class="block text-xs font-medium text-gray-500 mb-1">Región</label>
                      <select
                        [value]="nuevoIdRegion()"
                        (change)="onNuevoRegionChange(+getInputValue($event))"
                        class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                      >
                        <option [value]="0">Seleccionar región...</option>
                        @for (r of regionesConComunas(); track r.idRegion) {
                          <option [value]="r.idRegion">{{ r.nombre }}</option>
                        }
                      </select>
                    </div>

                    <div>
                      <label class="block text-xs font-medium text-gray-500 mb-1">Comuna</label>
                      <select
                        [value]="nuevoIdComuna()"
                        (change)="nuevoIdComuna.set(+getInputValue($event))"
                        [disabled]="nuevoIdRegion() === 0"
                        class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white disabled:opacity-50"
                      >
                        <option [value]="0">Seleccionar comuna...</option>
                        @for (c of comunasFiltradas(); track c.idComuna) {
                          <option [value]="c.idComuna">{{ c.nombre }}</option>
                        }
                      </select>
                    </div>

                  </div>
                </div>
              }

            </div>
          }

          <!-- ── Tab 1: Receta ──────────────────────────────────────────────── -->
          @if (tabActual() === 1) {
            <div class="p-6">

              <!-- Flags row -->
              <div class="flex flex-wrap gap-6 mb-5">
                <label class="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    [checked]="receta().cristalesLaboratorio"
                    (change)="updateRecetaField('cristalesLaboratorio', getCheckedValue($event))"
                    class="w-4 h-4 accent-blue-600"
                  />
                  <span class="text-sm font-medium text-gray-700">Cristales de Laboratorio</span>
                </label>
                <label class="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    [checked]="receta().urgente"
                    (change)="updateRecetaField('urgente', getCheckedValue($event))"
                    class="w-4 h-4 accent-red-500"
                  />
                  <span class="text-sm font-medium text-gray-700">Urgente</span>
                </label>
                <label class="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    [checked]="receta().incluirLejos"
                    (change)="updateRecetaField('incluirLejos', getCheckedValue($event))"
                    class="w-4 h-4 accent-blue-600"
                  />
                  <span class="text-sm font-medium text-gray-700">Incluir Cristales Lejos</span>
                </label>
                <label class="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    [checked]="receta().incluirCerca"
                    (change)="updateRecetaField('incluirCerca', getCheckedValue($event))"
                    class="w-4 h-4 accent-blue-600"
                  />
                  <span class="text-sm font-medium text-gray-700">Incluir Cristales Cerca</span>
                </label>
              </div>

              <!-- Cargar receta existente -->
              @if (recetasExistentes().length > 0) {
                <div class="relative mb-5 inline-block">
                  <button
                    type="button"
                    (click)="recetaDropdownAbierto.set(!recetaDropdownAbierto())"
                    class="flex items-center gap-2 px-3 py-2 rounded-lg border border-blue-200 text-sm text-blue-700 hover:bg-blue-50 transition-colors"
                  >
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                    </svg>
                    Cargar receta existente ▾
                  </button>
                  @if (recetaDropdownAbierto()) {
                    <div class="absolute top-full left-0 mt-1 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-48 overflow-y-auto">
                      @for (r of recetasExistentes(); track r.recetaCristalesId) {
                        <button
                          type="button"
                          (click)="cargarRecetaExistente(r)"
                          class="w-full text-left px-3 py-2 text-sm hover:bg-blue-50 transition-colors border-b border-gray-50 last:border-0"
                        >
                          <span class="font-medium text-gray-900">Receta del {{ r.fechaIngreso | date:'dd/MM/yyyy' }}</span>
                          <span class="text-gray-400 text-xs block">
                            @if (r.checkLejos) { Lejos }
                            @if (r.checkCerca) { · Cerca }
                          </span>
                        </button>
                      }
                    </div>
                  }
                </div>
              }
              @if (cargandoRecetas()) {
                <div class="flex items-center gap-2 text-sm text-gray-500 mb-4">
                  <div class="w-4 h-4 border-2 border-blue-300 border-t-blue-600 rounded-full animate-spin"></div>
                  Cargando recetas...
                </div>
              }

              <!-- Tablas de receta -->
              <div class="grid grid-cols-1 xl:grid-cols-2 gap-6">

                <!-- Tabla LEJOS -->
                @if (receta().incluirLejos) {
                  <div>
                    <h3 class="text-sm font-semibold mb-2" style="color: #2563EB">Lejos</h3>
                    <table class="w-full text-xs border-collapse">
                      <thead>
                        <tr class="bg-gray-50">
                          <th class="px-2 py-1.5 text-left font-medium text-gray-500 w-10"></th>
                          <th class="px-2 py-1.5 text-center font-medium text-gray-500">Esférico</th>
                          <th class="px-2 py-1.5 text-center font-medium text-gray-500">Cilíndrico</th>
                          <th class="px-2 py-1.5 text-center font-medium text-gray-500">Eje</th>
                          <th class="px-2 py-1.5 text-center font-medium text-gray-500">Observación</th>
                        </tr>
                      </thead>
                      <tbody class="divide-y divide-gray-100">
                        <!-- OD -->
                        <tr>
                          <td class="px-2 py-1.5 font-semibold text-blue-600">OD</td>
                          <td class="px-1 py-1"><input type="text" [value]="receta().lejosODEsferico" (input)="updateRecetaField('lejosODEsferico', getInputValue($event))" class="w-full border border-gray-200 rounded px-1.5 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-400 text-center" placeholder="+0.00" /></td>
                          <td class="px-1 py-1"><input type="text" [value]="receta().lejosODCilindro" (input)="updateRecetaField('lejosODCilindro', getInputValue($event))" class="w-full border border-gray-200 rounded px-1.5 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-400 text-center" placeholder="-0.00" /></td>
                          <td class="px-1 py-1"><input type="text" [value]="receta().lejosODEje" (input)="updateRecetaField('lejosODEje', getInputValue($event))" class="w-full border border-gray-200 rounded px-1.5 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-400 text-center" placeholder="°" /></td>
                          <td class="px-1 py-1"><input type="text" [value]="receta().lejosODObservacion" (input)="updateRecetaField('lejosODObservacion', getInputValue($event))" class="w-full border border-gray-200 rounded px-1.5 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-400" /></td>
                        </tr>
                        <!-- OI -->
                        <tr>
                          <td class="px-2 py-1.5 font-semibold text-blue-600">OI</td>
                          <td class="px-1 py-1"><input type="text" [value]="receta().lejosOIEsferico" (input)="updateRecetaField('lejosOIEsferico', getInputValue($event))" class="w-full border border-gray-200 rounded px-1.5 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-400 text-center" placeholder="+0.00" /></td>
                          <td class="px-1 py-1"><input type="text" [value]="receta().lejosOICilindro" (input)="updateRecetaField('lejosOICilindro', getInputValue($event))" class="w-full border border-gray-200 rounded px-1.5 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-400 text-center" placeholder="-0.00" /></td>
                          <td class="px-1 py-1"><input type="text" [value]="receta().lejosOIEje" (input)="updateRecetaField('lejosOIEje', getInputValue($event))" class="w-full border border-gray-200 rounded px-1.5 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-400 text-center" placeholder="°" /></td>
                          <td class="px-1 py-1"><input type="text" [value]="receta().lejosOIObservacion" (input)="updateRecetaField('lejosOIObservacion', getInputValue($event))" class="w-full border border-gray-200 rounded px-1.5 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-400" /></td>
                        </tr>
                        <!-- DP -->
                        <tr>
                          <td class="px-2 py-1.5 font-semibold text-blue-600">DP</td>
                          <td class="px-1 py-1"><input type="text" [value]="receta().lejosDPEsferico" (input)="updateRecetaField('lejosDPEsferico', getInputValue($event))" class="w-full border border-gray-200 rounded px-1.5 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-400 text-center" placeholder="mm" /></td>
                          <td class="px-1 py-1"></td>
                          <td class="px-1 py-1"></td>
                          <td class="px-1 py-1"><input type="text" [value]="receta().lejosDPObservacion" (input)="updateRecetaField('lejosDPObservacion', getInputValue($event))" class="w-full border border-gray-200 rounded px-1.5 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-400" /></td>
                        </tr>
                        <!-- ADD -->
                        <tr>
                          <td class="px-2 py-1.5 font-semibold text-blue-600">ADD</td>
                          <td class="px-1 py-1"><input type="text" [value]="receta().lejosADDEsfera" (input)="updateRecetaField('lejosADDEsfera', getInputValue($event))" class="w-full border border-gray-200 rounded px-1.5 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-400 text-center" placeholder="+0.00" /></td>
                          <td class="px-1 py-1"></td>
                          <td class="px-1 py-1"></td>
                          <td class="px-1 py-1"></td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                }

                <!-- Tabla CERCA -->
                @if (receta().incluirCerca) {
                  <div>
                    <h3 class="text-sm font-semibold mb-2" style="color: #2563EB">Cerca</h3>
                    <table class="w-full text-xs border-collapse">
                      <thead>
                        <tr class="bg-gray-50">
                          <th class="px-2 py-1.5 text-left font-medium text-gray-500 w-10"></th>
                          <th class="px-2 py-1.5 text-center font-medium text-gray-500">Esférico</th>
                          <th class="px-2 py-1.5 text-center font-medium text-gray-500">Cilíndrico</th>
                          <th class="px-2 py-1.5 text-center font-medium text-gray-500">Eje</th>
                          <th class="px-2 py-1.5 text-center font-medium text-gray-500">Observación</th>
                        </tr>
                      </thead>
                      <tbody class="divide-y divide-gray-100">
                        <!-- OD -->
                        <tr>
                          <td class="px-2 py-1.5 font-semibold text-blue-600">OD</td>
                          <td class="px-1 py-1"><input type="text" [value]="receta().cercaODEsferico" (input)="updateRecetaField('cercaODEsferico', getInputValue($event))" class="w-full border border-gray-200 rounded px-1.5 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-400 text-center" placeholder="+0.00" /></td>
                          <td class="px-1 py-1"><input type="text" [value]="receta().cercaODCilindro" (input)="updateRecetaField('cercaODCilindro', getInputValue($event))" class="w-full border border-gray-200 rounded px-1.5 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-400 text-center" placeholder="-0.00" /></td>
                          <td class="px-1 py-1"><input type="text" [value]="receta().cercaODEje" (input)="updateRecetaField('cercaODEje', getInputValue($event))" class="w-full border border-gray-200 rounded px-1.5 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-400 text-center" placeholder="°" /></td>
                          <td class="px-1 py-1"><input type="text" [value]="receta().cercaODObservacion" (input)="updateRecetaField('cercaODObservacion', getInputValue($event))" class="w-full border border-gray-200 rounded px-1.5 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-400" /></td>
                        </tr>
                        <!-- OI -->
                        <tr>
                          <td class="px-2 py-1.5 font-semibold text-blue-600">OI</td>
                          <td class="px-1 py-1"><input type="text" [value]="receta().cercaOIEsferico" (input)="updateRecetaField('cercaOIEsferico', getInputValue($event))" class="w-full border border-gray-200 rounded px-1.5 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-400 text-center" placeholder="+0.00" /></td>
                          <td class="px-1 py-1"><input type="text" [value]="receta().cercaOICilindro" (input)="updateRecetaField('cercaOICilindro', getInputValue($event))" class="w-full border border-gray-200 rounded px-1.5 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-400 text-center" placeholder="-0.00" /></td>
                          <td class="px-1 py-1"><input type="text" [value]="receta().cercaOIEje" (input)="updateRecetaField('cercaOIEje', getInputValue($event))" class="w-full border border-gray-200 rounded px-1.5 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-400 text-center" placeholder="°" /></td>
                          <td class="px-1 py-1"><input type="text" [value]="receta().cercaOIObservacion" (input)="updateRecetaField('cercaOIObservacion', getInputValue($event))" class="w-full border border-gray-200 rounded px-1.5 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-400" /></td>
                        </tr>
                        <!-- DP -->
                        <tr>
                          <td class="px-2 py-1.5 font-semibold text-blue-600">DP</td>
                          <td class="px-1 py-1"><input type="text" [value]="receta().cercaDPEsferico" (input)="updateRecetaField('cercaDPEsferico', getInputValue($event))" class="w-full border border-gray-200 rounded px-1.5 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-400 text-center" placeholder="mm" /></td>
                          <td class="px-1 py-1"></td>
                          <td class="px-1 py-1"></td>
                          <td class="px-1 py-1"><input type="text" [value]="receta().cercaDPObservacion" (input)="updateRecetaField('cercaDPObservacion', getInputValue($event))" class="w-full border border-gray-200 rounded px-1.5 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-400" /></td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                }

                @if (!receta().incluirLejos && !receta().incluirCerca) {
                  <div class="col-span-2 text-sm text-gray-400 text-center py-8">
                    Activa "Incluir Cristales Lejos" o "Incluir Cristales Cerca" para ingresar la receta.
                  </div>
                }

              </div>

              @if (!recetaEsValida() && (receta().incluirLejos || receta().incluirCerca)) {
                <div class="mt-4 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
                  Ingresa al menos el valor esférico del ojo derecho o izquierdo en la sección activa.
                </div>
              }
            </div>
          }

          <!-- ── Tab 2: Productos/Servicios ──────────────────────────────────── -->
          @if (tabActual() === 2) {
            <div class="p-6">
              <div class="grid grid-cols-5 gap-6">

                <!-- Left form (2/5) -->
                <div class="col-span-5 md:col-span-2 space-y-3">
                  <h3 class="text-sm font-semibold" style="color: #0D1B3D">Agregar producto</h3>

                  <div>
                    <label class="block text-xs font-medium text-gray-500 mb-1">Tipo Producto</label>
                    <select
                      [value]="addCategoria()"
                      (change)="addCategoria.set(getInputValue($event)); addProductoBusqueda.set(''); addProductoId.set('')"
                      class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    >
                      <option value="">— TODAS —</option>
                      @for (cat of categorias(); track cat.categoriaId) {
                        <option [value]="cat.categoriaId">{{ cat.nombre }}</option>
                      }
                    </select>
                  </div>

                  <div class="relative">
                    <label class="block text-xs font-medium text-gray-500 mb-1">Producto</label>
                    <input
                      type="text"
                      [value]="addProductoBusqueda()"
                      (input)="onAddProductoBusqueda(getInputValue($event))"
                      (focus)="addProductoDropdown.set(addProductoResultados().length > 0)"
                      placeholder="Buscar producto..."
                      class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    @if (addProductoDropdown() && addProductoResultados().length > 0) {
                      <div class="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-48 overflow-y-auto">
                        @for (p of addProductoResultados(); track p.productoId) {
                          <button
                            type="button"
                            (click)="seleccionarProductoAdd(p)"
                            class="w-full text-left px-3 py-2 text-sm hover:bg-blue-50 transition-colors"
                          >
                            <span class="font-medium text-gray-900">{{ p.nombre }}</span>
                            @if (p.precioVenta) {
                              <span class="text-gray-400 ml-2 text-xs">{{ p.precioVenta | currency:'CLP':'symbol-narrow':'1.0-0' }}</span>
                            }
                          </button>
                        }
                      </div>
                    }
                  </div>

                  <div>
                    <label class="block text-xs font-medium text-gray-500 mb-1">Cantidad</label>
                    <input
                      type="number"
                      [value]="addProductoCantidad()"
                      (input)="addProductoCantidad.set(+getInputValue($event))"
                      min="1"
                      class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label class="block text-xs font-medium text-gray-500 mb-1">Valor</label>
                    <input
                      type="number"
                      [value]="addProductoValor()"
                      (input)="addProductoValor.set(+getInputValue($event))"
                      min="0"
                      class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label class="block text-xs font-medium text-gray-500 mb-1">Observación</label>
                    <textarea
                      [value]="addProductoObservacion()"
                      (input)="addProductoObservacion.set(getInputValue($event))"
                      rows="2"
                      class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    ></textarea>
                  </div>

                  <button
                    type="button"
                    (click)="agregarLinea()"
                    [disabled]="!addProductoId() || addProductoCantidad() <= 0"
                    class="w-full py-2 rounded-lg text-sm font-semibold text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    style="background: #2563EB"
                  >
                    + Agregar
                  </button>
                </div>

                <!-- Right table (3/5) -->
                <div class="col-span-5 md:col-span-3">
                  <h3 class="text-sm font-semibold mb-2" style="color: #0D1B3D">Productos agregados</h3>
                  @if (lineas().length === 0) {
                    <div class="text-center py-10 text-sm text-gray-400">
                      Agrega al menos un producto para continuar.
                    </div>
                  } @else {
                    <div class="overflow-x-auto">
                      <table class="w-full text-xs">
                        <thead>
                          <tr class="border-b border-gray-100">
                            <th class="text-left py-2 px-2 font-medium text-gray-500">Producto</th>
                            <th class="text-center py-2 px-2 font-medium text-gray-500">Cant</th>
                            <th class="text-right py-2 px-2 font-medium text-gray-500">Valor</th>
                            <th class="text-left py-2 px-2 font-medium text-gray-500">Obs</th>
                            <th class="text-right py-2 px-2 font-medium text-gray-500">Total</th>
                            <th class="py-2 px-2 w-8"></th>
                          </tr>
                        </thead>
                        <tbody class="divide-y divide-gray-100">
                          @for (l of lineas(); track $index; let i = $index) {
                            <tr class="hover:bg-gray-50">
                              <td class="py-2 px-2 font-medium text-gray-800">{{ l.productoNombre }}</td>
                              <td class="py-2 px-2 text-center text-gray-600">{{ l.cantidad }}</td>
                              <td class="py-2 px-2 text-right text-gray-600">{{ l.valorUnitario | currency:'CLP':'symbol-narrow':'1.0-0' }}</td>
                              <td class="py-2 px-2 text-gray-500 text-xs max-w-24 truncate">{{ l.comentario }}</td>
                              <td class="py-2 px-2 text-right font-semibold text-gray-800">{{ l.cantidad * l.valorUnitario | currency:'CLP':'symbol-narrow':'1.0-0' }}</td>
                              <td class="py-2 px-2">
                                <button
                                  type="button"
                                  (click)="eliminarLinea(i)"
                                  class="p-1 rounded text-red-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                                  title="Eliminar"
                                >
                                  <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                                  </svg>
                                </button>
                              </td>
                            </tr>
                          }
                        </tbody>
                        <tfoot>
                          <tr class="border-t border-gray-200">
                            <td colspan="4" class="py-2 px-2 text-right text-xs font-medium text-gray-500">Subtotal:</td>
                            <td class="py-2 px-2 text-right font-semibold text-gray-800">{{ subTotal() | currency:'CLP':'symbol-narrow':'1.0-0' }}</td>
                            <td></td>
                          </tr>
                          <tr>
                            <td colspan="4" class="py-1 px-2 text-right text-xs font-medium text-gray-500">
                              Descuento:
                            </td>
                            <td class="py-1 px-2 text-right">
                              <input
                                type="number"
                                [value]="descuento()"
                                (input)="descuento.set(+getInputValue($event))"
                                min="0"
                                class="w-24 border border-gray-200 rounded px-2 py-0.5 text-xs text-right focus:outline-none focus:ring-1 focus:ring-blue-400"
                              />
                            </td>
                            <td></td>
                          </tr>
                          <tr class="border-t border-gray-200">
                            <td colspan="4" class="py-2 px-2 text-right text-sm font-bold" style="color: #0D1B3D">TOTAL:</td>
                            <td class="py-2 px-2 text-right text-sm font-bold" style="color: #0D1B3D">{{ montoTotal() | currency:'CLP':'symbol-narrow':'1.0-0' }}</td>
                            <td></td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  }
                </div>

              </div>
            </div>
          }

          <!-- ── Tab 3: Abonos (create only) ───────────────────────────────── -->
          @if (tabActual() === 3 && !modoEdicion()) {
            <div class="p-6">
              <div class="grid grid-cols-1 md:grid-cols-3 gap-6">

                <!-- Left: Agregar abono -->
                <div class="space-y-3">
                  <h3 class="text-sm font-semibold" style="color: #0D1B3D">Registrar abono</h3>
                  <div>
                    <label class="block text-xs font-medium text-gray-500 mb-1">Total OT</label>
                    <input
                      type="text"
                      [value]="montoTotal() | currency:'CLP':'symbol-narrow':'1.0-0'"
                      readonly
                      class="w-full border border-gray-100 rounded-lg px-3 py-2 text-sm bg-gray-50 text-gray-600 cursor-default"
                    />
                  </div>
                  <div>
                    <label class="block text-xs font-medium text-gray-500 mb-1">Abona con</label>
                    <select
                      [value]="abonoFormaPagoId()"
                      (change)="abonoFormaPagoId.set(+getInputValue($event))"
                      class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    >
                      <option [value]="0">Seleccionar...</option>
                      @for (fp of formasPago(); track fp.formaPagoId) {
                        <option [value]="fp.formaPagoId">{{ fp.descripcion }}</option>
                      }
                    </select>
                  </div>
                  <div>
                    <label class="block text-xs font-medium text-gray-500 mb-1">Monto</label>
                    <input
                      type="number"
                      [value]="abonoMonto()"
                      (input)="abonoMonto.set(+getInputValue($event))"
                      min="0"
                      class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <button
                    type="button"
                    (click)="agregarAbono()"
                    [disabled]="abonoFormaPagoId() === 0 || abonoMonto() <= 0"
                    class="w-full py-2 rounded-lg text-sm font-semibold text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    style="background: #2563EB"
                  >
                    + Abonar
                  </button>
                </div>

                <!-- Center: Lista abonos -->
                <div>
                  <h3 class="text-sm font-semibold mb-2" style="color: #0D1B3D">Abonos registrados</h3>
                  @if (abonos().length === 0) {
                    <p class="text-sm text-gray-400 text-center py-6">Sin abonos</p>
                  } @else {
                    <table class="w-full text-xs">
                      <thead>
                        <tr class="border-b border-gray-100">
                          <th class="text-left py-1.5 font-medium text-gray-500">Abona con</th>
                          <th class="text-right py-1.5 font-medium text-gray-500">Monto</th>
                          <th class="w-8"></th>
                        </tr>
                      </thead>
                      <tbody class="divide-y divide-gray-100">
                        @for (a of abonos(); track $index; let i = $index) {
                          <tr>
                            <td class="py-2 font-medium text-gray-800">{{ a.formaPagoDescripcion }}</td>
                            <td class="py-2 text-right text-gray-700">{{ a.monto | currency:'CLP':'symbol-narrow':'1.0-0' }}</td>
                            <td class="py-2">
                              <button
                                type="button"
                                (click)="eliminarAbono(i)"
                                class="p-1 rounded text-red-400 hover:text-red-600 transition-colors"
                                title="Eliminar"
                              >
                                <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                                </svg>
                              </button>
                            </td>
                          </tr>
                        }
                      </tbody>
                      <tfoot>
                        <tr class="border-t border-gray-200">
                          <td class="py-1.5 font-semibold text-gray-700 text-xs">Total:</td>
                          <td class="py-1.5 text-right font-semibold text-gray-800 text-xs">{{ totalAbonado() | currency:'CLP':'symbol-narrow':'1.0-0' }}</td>
                          <td></td>
                        </tr>
                      </tfoot>
                    </table>
                  }
                </div>

                <!-- Right: Saldo y cuotas -->
                <div class="space-y-3">
                  <h3 class="text-sm font-semibold" style="color: #0D1B3D">Saldo y cuotas</h3>
                  <div>
                    <label class="block text-xs font-medium text-gray-500 mb-1">Saldo</label>
                    <input
                      type="text"
                      [value]="saldo() | currency:'CLP':'symbol-narrow':'1.0-0'"
                      readonly
                      class="w-full border border-gray-100 rounded-lg px-3 py-2 text-sm bg-gray-50 cursor-default"
                      [class.text-red-600]="saldo() > 0"
                      [class.text-green-600]="saldo() <= 0"
                    />
                  </div>
                  <div>
                    <label class="block text-xs font-medium text-gray-500 mb-1">N° Cuotas</label>
                    <input
                      type="number"
                      [value]="numeroCuotas()"
                      (input)="numeroCuotas.set(+getInputValue($event))"
                      min="0"
                      class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  @if (numeroCuotas() > 0) {
                    <div>
                      <label class="block text-xs font-medium text-gray-500 mb-1">Valor Cuota</label>
                      <input
                        type="text"
                        [value]="valorCuota() | currency:'CLP':'symbol-narrow':'1.0-0'"
                        readonly
                        class="w-full border border-gray-100 rounded-lg px-3 py-2 text-sm bg-gray-50 text-gray-600 cursor-default"
                      />
                    </div>
                    <div>
                      <label class="block text-xs font-medium text-gray-500 mb-1">F. Inicio Pago</label>
                      <input
                        type="date"
                        [value]="fechaInicioCuotas()"
                        (input)="fechaInicioCuotas.set(getInputValue($event))"
                        class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  }
                  @if (cuotasPreview().length > 0) {
                    <div class="mt-4">
                      <h4 class="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Plan de cuotas (preview)</h4>
                      <table class="w-full text-xs border-collapse">
                        <thead>
                          <tr class="bg-gray-50 border-b border-gray-200">
                            <th class="px-2 py-1.5 text-center font-medium text-gray-500">N°</th>
                            <th class="px-2 py-1.5 text-left font-medium text-gray-500">Vencimiento</th>
                            <th class="px-2 py-1.5 text-right font-medium text-gray-500">Valor</th>
                          </tr>
                        </thead>
                        <tbody class="divide-y divide-gray-100">
                          @for (c of cuotasPreview(); track c.numero) {
                            <tr class="hover:bg-gray-50">
                              <td class="px-2 py-1.5 text-center text-gray-600">{{ c.numero }}</td>
                              <td class="px-2 py-1.5 text-gray-700">{{ c.vencimiento | date:'dd/MM/yyyy' }}</td>
                              <td class="px-2 py-1.5 text-right font-medium text-gray-800">{{ c.valor | currency:'CLP':'symbol-narrow':'1.0-0' }}</td>
                            </tr>
                          }
                        </tbody>
                      </table>
                    </div>
                  }
                </div>

              </div>
            </div>
          }

          <!-- ── Footer nav ─────────────────────────────────────────────────── -->
          <div class="flex justify-between items-center px-6 py-4 border-t border-gray-100 bg-gray-50">
            <button
              type="button"
              (click)="volver()"
              class="px-5 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-white transition-colors"
            >
              ← Volver
            </button>
            <div class="flex gap-3">
              @if (tabActual() > 0) {
                <button
                  type="button"
                  (click)="tabActual.update(t => t - 1)"
                  class="px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-white transition-colors"
                >
                  ← Anterior
                </button>
              }
              @if (!esUltimoTab()) {
                <button
                  type="button"
                  (click)="siguiente()"
                  [disabled]="!puedeAvanzar()"
                  class="px-5 py-2 rounded-lg text-sm font-semibold text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90"
                  style="background: #2563EB"
                >
                  Siguiente →
                </button>
              } @else {
                <button
                  type="button"
                  (click)="finalizar()"
                  [disabled]="guardando()"
                  class="px-5 py-2 rounded-lg text-sm font-semibold text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90"
                  style="background: #2563EB"
                >
                  @if (guardando()) {
                    <span class="flex items-center gap-2">
                      <div class="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin"></div>
                      Guardando...
                    </span>
                  } @else {
                    → Finalizar
                  }
                </button>
              }
            </div>
          </div>

        </div>
      }
    </div>
  `,
})
export class OrdenTrabajoFormComponent implements OnInit {
  private readonly service        = inject(OrdenTrabajoService);
  private readonly clienteSvc     = inject(ClienteService);
  private readonly productoSvc    = inject(ProductoService);
  private readonly categoriaSvc   = inject(ProductoCategoriaService);
  private readonly formaPagoSvc   = inject(FormaPagoService);
  private readonly recetaSvc      = inject(RecetaCristalesService);
  private readonly regionSvc      = inject(RegionService);
  private readonly previsionSvc   = inject(PrevisionService);
  private readonly router         = inject(Router);
  private readonly route          = inject(ActivatedRoute);
  readonly destroyRef             = inject(DestroyRef);

  readonly tiposFacturacion = TIPOS_FACTURACION;

  // ─── Navigation ────────────────────────────────────────────────────────────

  readonly tabActual          = signal(0);
  readonly modoEdicion        = signal(false);
  readonly otIdEdicion        = signal<string | null>(null);
  readonly cargandoDetalle    = signal(false);
  readonly guardando          = signal(false);

  // ─── Header card ───────────────────────────────────────────────────────────

  readonly numeroOT           = signal('');
  readonly fechaHoy           = new Date().toISOString().substring(0, 10);
  readonly fechaEntrega       = signal('');
  readonly horaEntrega        = signal('');
  readonly beneficiario       = signal('');
  readonly tipoFacturacion    = signal<'Particular' | 'Empresa'>('Particular');
  readonly empresaClienteId   = signal('');
  readonly empresaBusqueda    = signal('');
  readonly resultadosEmpresa  = signal<Cliente[]>([]);
  readonly empresaDropdownAbierto = signal(false);
  readonly verificandoNumero  = signal(false);
  readonly numeroOTDisponible = signal<boolean | null>(null);
  private verificarTimer: ReturnType<typeof setTimeout> | null = null;

  // ─── Tab 0 - Cliente ───────────────────────────────────────────────────────

  readonly tipoDocumento      = signal<'RUT' | 'Otro'>('RUT');
  readonly numeroDocumento    = signal('');
  readonly buscandoCliente    = signal(false);
  readonly clienteId          = signal('');
  readonly clienteEncontrado  = signal<Cliente | null>(null);
  readonly clienteNoEncontrado = signal(false);
  // Nuevo cliente form
  readonly nuevoNombre        = signal('');
  readonly nuevoFechaNacimiento = signal('');
  readonly nuevoPrevision     = signal('');
  readonly nuevoCelular       = signal('');
  readonly nuevoMail          = signal('');
  readonly nuevoDireccion     = signal('');
  readonly nuevoIdRegion      = signal(0);
  readonly nuevoIdComuna      = signal(0);

  // ─── Tab 0 - Nuevo cliente: Regiones/Comunas desde API ────────────────────

  readonly regionesConComunas = signal<RegionWithComunas[]>([]);

  // ─── Tab 0 - Previsiones desde API ────────────────────────────────────────

  readonly tiposPrevisiones   = signal<TipoPrevisionDto[]>([]);

  // ─── Tab 1 - Receta ────────────────────────────────────────────────────────

  readonly receta             = signal<RecetaForm>(emptyReceta());
  readonly recetasExistentes  = signal<RecetaCristalesDto[]>([]);
  readonly cargandoRecetas    = signal(false);
  readonly recetaDropdownAbierto = signal(false);
  readonly recetaCristalesIdExistente = signal<string | null>(null);

  // ─── Tab 2 - Productos/Servicios ───────────────────────────────────────────

  readonly categorias         = signal<CategoriaDto[]>([]);
  readonly addCategoria       = signal('');
  readonly addProductoBusqueda = signal('');
  readonly addProductoId      = signal('');
  readonly addProductoNombre  = signal('');
  readonly addProductoCantidad = signal(1);
  readonly addProductoValor   = signal(0);
  readonly addProductoObservacion = signal('');
  readonly addProductoResultados = signal<ProductoDto[]>([]);
  readonly addProductoDropdown = signal(false);
  readonly lineas             = signal<LineaForm[]>([]);
  readonly descuento          = signal(0);

  // ─── Tab 3 - Abonos ────────────────────────────────────────────────────────

  readonly formasPago         = signal<FormaPagoDto[]>([]);
  readonly abonoFormaPagoId   = signal(0);
  readonly abonoMonto         = signal(0);
  readonly abonos             = signal<AbonoForm[]>([]);
  readonly numeroCuotas       = signal(0);
  readonly fechaInicioCuotas  = signal('');

  // ─── Subjects ──────────────────────────────────────────────────────────────

  private readonly empresaSearch$ = new Subject<string>();

  // ─── Computed ──────────────────────────────────────────────────────────────

  readonly tabsDisponibles = computed(() =>
    this.modoEdicion()
      ? ['Cliente', 'Receta', 'Productos o Servicios']
      : ['Cliente', 'Receta', 'Productos o Servicios', 'Abonos'],
  );

  readonly esUltimoTab = computed(
    () => this.tabActual() === this.tabsDisponibles().length - 1,
  );

  readonly comunasFiltradas = computed(() => {
    const r = this.regionesConComunas().find(reg => reg.idRegion === this.nuevoIdRegion());
    return r?.comunas ?? [];
  });

  readonly subTotal = computed(() =>
    this.lineas().reduce((s, l) => s + l.cantidad * l.valorUnitario, 0),
  );

  readonly montoTotal = computed(() =>
    Math.max(0, this.subTotal() - this.descuento()),
  );

  readonly totalAbonado = computed(() =>
    this.abonos().reduce((s, a) => s + a.monto, 0),
  );

  readonly saldo = computed(() =>
    Math.max(0, this.montoTotal() - this.totalAbonado()),
  );

  readonly valorCuota = computed(() =>
    this.numeroCuotas() > 0
      ? Math.floor(this.saldo() / this.numeroCuotas())
      : 0,
  );

  readonly recetaTieneData = computed(() => {
    const r = this.receta();
    return [
      r.lejosODEsferico, r.lejosOIEsferico,
      r.cercaODEsferico, r.cercaOIEsferico,
      r.lejosDPEsferico,
    ].some(v => v.trim() !== '');
  });

  readonly recetaEsValida = computed(() => {
    const r = this.receta();
    // Sin secciones activas → receta opcional, válida
    if (!r.incluirLejos && !r.incluirCerca) return true;
    // Válida si AL MENOS UNA sección activa tiene dato en esférico OD o OI
    const lejosConData = r.incluirLejos && (r.lejosODEsferico.trim() !== '' || r.lejosOIEsferico.trim() !== '');
    const cercaConData = r.incluirCerca && (r.cercaODEsferico.trim() !== '' || r.cercaOIEsferico.trim() !== '');
    return lejosConData || cercaConData;
  });

  readonly cuotasPreview = computed(() => {
    const n = this.numeroCuotas();
    const fechaStr = this.fechaInicioCuotas();
    const valor = this.valorCuota();
    if (n <= 0 || !fechaStr || valor <= 0) return [];

    const cuotas: { numero: number; vencimiento: string; valor: number }[] = [];
    const base = new Date(fechaStr + 'T00:00:00');
    for (let i = 0; i < n; i++) {
      const fecha = new Date(base);
      fecha.setMonth(fecha.getMonth() + i);
      cuotas.push({
        numero: i + 1,
        vencimiento: fecha.toISOString().substring(0, 10),
        valor,
      });
    }
    return cuotas;
  });

  readonly puedeAvanzar = computed(() => {
    const tab = this.tabActual();
    if (tab === 0) {
      const validOT =
        this.numeroOT().trim().length > 0 &&
        this.numeroOTDisponible() !== false &&
        this.fechaEntrega().length > 0;
      const clienteOK =
        this.clienteId().length > 0 ||
        (this.clienteNoEncontrado() && this.nuevoNombre().trim().length > 0);
      return validOT && clienteOK;
    }
    if (tab === 1) return this.recetaEsValida();
    if (tab === 2)
      return (
        this.lineas().length > 0 &&
        this.lineas().every(l => l.productoId.length > 0 && l.cantidad > 0)
      );
    return true;
  });

  // ─── Lifecycle ─────────────────────────────────────────────────────────────

  ngOnInit(): void {
    // Load catalogues
    this.formaPagoSvc
      .getAll()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(fps => this.formasPago.set(fps));

    this.categoriaSvc
      .getAll()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(cats => this.categorias.set(cats));

    this.regionSvc
      .getRegionesWithComunas()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(r => this.regionesConComunas.set(r));

    this.previsionSvc
      .getAll()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(ps => this.tiposPrevisiones.set(ps));

    // Empresa debounce search
    this.empresaSearch$
      .pipe(
        debounceTime(350),
        distinctUntilChanged(),
        switchMap(q => this.clienteSvc.getClientes(1, 10, q, 'Empresa')),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(r => this.resultadosEmpresa.set(r.items));

    // Check edit mode
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.modoEdicion.set(true);
      this.otIdEdicion.set(id);
      this.cargarDetalle(id);
    }
  }

  // ─── Load detail (edit mode) ───────────────────────────────────────────────

  private cargarDetalle(id: string): void {
    this.cargandoDetalle.set(true);
    this.service
      .getById(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: ot => {
          this.numeroOT.set(ot.numeroOT);
          this.numeroOTDisponible.set(true);
          this.clienteId.set(ot.clienteId);
          // Populate a minimal Cliente object to show info card
          this.clienteEncontrado.set({
            clienteId: ot.clienteId,
            tenantId: '',
            tipoCliente: 'Persona',
            numeroDocumento: '',
            nombre: ot.clienteNombre,
          });
          this.tipoFacturacion.set(ot.tipoFacturacion);
          this.beneficiario.set(ot.beneficiario ?? '');
          this.empresaClienteId.set(ot.empresaClienteId ?? '');
          this.empresaBusqueda.set('');
          this.fechaEntrega.set(ot.fechaEntrega?.substring(0, 10) ?? '');
          this.horaEntrega.set(ot.horaEntrega ?? '');
          this.descuento.set(ot.descuento);
          this.numeroCuotas.set(ot.numeroCuotas);
          this.fechaInicioCuotas.set(ot.fechaInicioCuotas?.substring(0, 10) ?? '');
          this.lineas.set(
            ot.lineas.map(l => ({
              productoId: l.productoId,
              productoNombre: l.productoNombre,
              cantidad: l.cantidad,
              valorUnitario: l.valorUnitario,
              comentario: l.comentario ?? '',
            })),
          );
          // Cargar receta si existe
          if (ot.recetaCristalesId) {
            this.recetaCristalesIdExistente.set(ot.recetaCristalesId);
            this.recetaSvc.getById(ot.recetaCristalesId)
              .pipe(takeUntilDestroyed(this.destroyRef))
              .subscribe({
                next: r => {
                  this.receta.set({
                    cristalesLaboratorio: r.checkCristalesLaboratorio,
                    urgente: r.checkUrgente,
                    incluirLejos: r.checkLejos,
                    incluirCerca: r.checkCerca,
                    lejosODEsferico: r.lejosODEsferico ?? '',
                    lejosODCilindro: r.lejosODCilindro ?? '',
                    lejosODEje: r.lejosODEje ?? '',
                    lejosODObservacion: r.lejosODObservacion ?? '',
                    lejosOIEsferico: r.lejosOIEsferico ?? '',
                    lejosOICilindro: r.lejosOICilindro ?? '',
                    lejosOIEje: r.lejosOIEje ?? '',
                    lejosOIObservacion: r.lejosOIObservacion ?? '',
                    lejosDPEsferico: r.lejosDPEsferico ?? '',
                    lejosDPObservacion: r.lejosDPObservacion ?? '',
                    lejosADDEsfera: r.lejosADDEsfera ?? '',
                    cercaODEsferico: r.cercaODEsferico ?? '',
                    cercaODCilindro: r.cercaODCilindro ?? '',
                    cercaODEje: r.cercaODEje ?? '',
                    cercaODObservacion: r.cercaODObservacion ?? '',
                    cercaOIEsferico: r.cercaOIEsferico ?? '',
                    cercaOICilindro: r.cercaOICilindro ?? '',
                    cercaOIEje: r.cercaOIEje ?? '',
                    cercaOIObservacion: r.cercaOIObservacion ?? '',
                    cercaDPEsferico: r.cercaDPEsferico ?? '',
                    cercaDPObservacion: r.cercaDPObservacion ?? '',
                  });
                },
                error: () => {}, // silent: no blocking
              });
          }
          this.cargandoDetalle.set(false);
        },
        error: () => this.cargandoDetalle.set(false),
      });
  }

  // ─── Navigation methods ────────────────────────────────────────────────────

  siguiente(): void {
    if (!this.puedeAvanzar() || this.esUltimoTab()) return;
    if (this.tabActual() === 0 && this.clienteNoEncontrado() && !this.clienteId()) {
      this.crearClienteNuevo().then(() => {
        if (this.clienteId()) this.cargarRecetas();
        this.tabActual.update(t => t + 1);
      });
    } else {
      if (this.tabActual() === 0 && this.clienteId()) this.cargarRecetas();
      this.tabActual.update(t => t + 1);
    }
  }

  volver(): void {
    if (this.tabActual() === 0) {
      this.router.navigate(['/ordenes-trabajo']);
    } else {
      this.tabActual.update(t => t - 1);
    }
  }

  irATab(i: number): void {
    if (i < this.tabActual()) this.tabActual.set(i);
  }

  // ─── Client search ─────────────────────────────────────────────────────────

  buscarCliente(): void {
    const doc = this.numeroDocumento().trim();
    if (!doc) return;
    this.buscandoCliente.set(true);
    this.clienteEncontrado.set(null);
    this.clienteNoEncontrado.set(false);
    this.clienteId.set('');
    this.clienteSvc
      .getClientes(1, 5, doc, 'Persona')
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: r => {
          this.buscandoCliente.set(false);
          if (r.items.length > 0) {
            this.seleccionarClienteEncontrado(r.items[0]);
          } else {
            this.clienteNoEncontrado.set(true);
          }
        },
        error: () => this.buscandoCliente.set(false),
      });
  }

  seleccionarClienteEncontrado(c: Cliente): void {
    this.clienteId.set(c.clienteId);
    this.clienteEncontrado.set(c);
    this.clienteNoEncontrado.set(false);
  }

  private async crearClienteNuevo(): Promise<void> {
    return new Promise((resolve, reject) => {
      const req: CreateClienteDto = {
        tenantId: '',
        tipoCliente: 'Persona',
        numeroDocumento: this.numeroDocumento().trim(),
        nombre: this.nuevoNombre().trim(),
        fechaNacimiento: this.nuevoFechaNacimiento() || undefined,
        tipoPrevision: this.nuevoPrevision() || undefined,
        celular: this.nuevoCelular() || undefined,
        mail: this.nuevoMail() || undefined,
        direccion: this.nuevoDireccion() || undefined,
        idComuna: this.nuevoIdComuna() || undefined,
      };
      this.clienteSvc
        .createCliente(req)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: c => {
            this.clienteId.set(c.clienteId);
            this.clienteEncontrado.set(c);
            resolve();
          },
          error: reject,
        });
    });
  }

  onNuevoRegionChange(idRegion: number): void {
    this.nuevoIdRegion.set(idRegion);
    this.nuevoIdComuna.set(0);
  }

  // ─── Receta ────────────────────────────────────────────────────────────────

  cargarRecetas(): void {
    if (!this.clienteId()) return;
    this.cargandoRecetas.set(true);
    this.recetaSvc
      .getByCliente(this.clienteId())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: r => {
          this.recetasExistentes.set(r);
          this.cargandoRecetas.set(false);
        },
        error: () => this.cargandoRecetas.set(false),
      });
  }

  cargarRecetaExistente(r: RecetaCristalesDto): void {
    this.recetaDropdownAbierto.set(false);
    this.receta.set({
      cristalesLaboratorio: r.checkCristalesLaboratorio,
      urgente: r.checkUrgente,
      incluirLejos: r.checkLejos,
      incluirCerca: r.checkCerca,
      lejosODEsferico: r.lejosODEsferico ?? '',
      lejosODCilindro: r.lejosODCilindro ?? '',
      lejosODEje: r.lejosODEje ?? '',
      lejosODObservacion: r.lejosODObservacion ?? '',
      lejosOIEsferico: r.lejosOIEsferico ?? '',
      lejosOICilindro: r.lejosOICilindro ?? '',
      lejosOIEje: r.lejosOIEje ?? '',
      lejosOIObservacion: r.lejosOIObservacion ?? '',
      lejosDPEsferico: r.lejosDPEsferico ?? '',
      lejosDPObservacion: r.lejosDPObservacion ?? '',
      lejosADDEsfera: r.lejosADDEsfera ?? '',
      cercaODEsferico: r.cercaODEsferico ?? '',
      cercaODCilindro: r.cercaODCilindro ?? '',
      cercaODEje: r.cercaODEje ?? '',
      cercaODObservacion: r.cercaODObservacion ?? '',
      cercaOIEsferico: r.cercaOIEsferico ?? '',
      cercaOICilindro: r.cercaOICilindro ?? '',
      cercaOIEje: r.cercaOIEje ?? '',
      cercaOIObservacion: r.cercaOIObservacion ?? '',
      cercaDPEsferico: r.cercaDPEsferico ?? '',
      cercaDPObservacion: r.cercaDPObservacion ?? '',
    });
  }

  updateRecetaField<K extends keyof RecetaForm>(field: K, value: RecetaForm[K]): void {
    this.receta.update(r => this.applyRecetaCalc({ ...r, [field]: value }, field as string));
  }

  private applyRecetaCalc(r: RecetaForm, field: string): RecetaForm {
    const parseVal = (s: string): number => {
      const n = parseFloat(s.trim().replace(',', '.'));
      return isNaN(n) ? 0 : n;
    };
    const fmt = (n: number): string => {
      const s = (Math.round(n * 100) / 100).toFixed(2);
      return s === '-0.00' ? '0.00' : s;
    };

    const add = parseVal(r.lejosADDEsfera);
    const hasAdd = add > 0;

    // Cuando ADD cambia: rellena/limpia Cerca completo
    if (field === 'lejosADDEsfera') {
      if (hasAdd) {
        return {
          ...r,
          incluirCerca: true,
          cercaODEsferico: fmt(parseVal(r.lejosODEsferico) + add),
          cercaOIEsferico: fmt(parseVal(r.lejosOIEsferico) + add),
          cercaODCilindro: r.lejosODCilindro,
          cercaOICilindro: r.lejosOICilindro,
          cercaODEje:      r.lejosODEje,
          cercaOIEje:      r.lejosOIEje,
        };
      }
      // ADD vacío/cero → limpiar Cerca
      return {
        ...r,
        incluirCerca: false,
        cercaODEsferico: '', cercaODCilindro: '', cercaODEje: '', cercaODObservacion: '',
        cercaOIEsferico: '', cercaOICilindro: '', cercaOIEje: '', cercaOIObservacion: '',
        cercaDPEsferico: '', cercaDPObservacion: '',
      };
    }

    // Para el resto solo aplica si ADD tiene valor
    if (!hasAdd) return r;

    switch (field) {
      case 'lejosODEsferico':
        return { ...r, cercaODEsferico: fmt(parseVal(r.lejosODEsferico) + add) };
      case 'lejosODCilindro':
        return { ...r, cercaODCilindro: r.lejosODCilindro };
      case 'lejosODEje':
        return { ...r, cercaODEje: r.lejosODEje };
      case 'lejosOIEsferico':
        return { ...r, cercaOIEsferico: fmt(parseVal(r.lejosOIEsferico) + add) };
      case 'lejosOICilindro':
        return { ...r, cercaOICilindro: r.lejosOICilindro };
      case 'lejosOIEje':
        return { ...r, cercaOIEje: r.lejosOIEje };
      default:
        return r;
    }
  }

  // ─── Products ──────────────────────────────────────────────────────────────

  onAddProductoBusqueda(valor: string): void {
    this.addProductoBusqueda.set(valor);
    this.addProductoId.set('');
    this.addProductoDropdown.set(true);
    if (valor.trim().length >= 2) {
      this.productoSvc
        .getAll({
          busqueda: valor.trim(),
          categoriaId: this.addCategoria() || undefined,
          pageSize: 10,
        })
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe(r => this.addProductoResultados.set(r.items));
    } else {
      this.addProductoResultados.set([]);
    }
  }

  seleccionarProductoAdd(p: ProductoDto): void {
    this.addProductoId.set(p.productoId);
    this.addProductoNombre.set(p.nombre);
    this.addProductoBusqueda.set(p.nombre);
    if (p.precioVenta) this.addProductoValor.set(p.precioVenta);
    this.addProductoDropdown.set(false);
    this.addProductoResultados.set([]);
  }

  agregarLinea(): void {
    if (!this.addProductoId() || this.addProductoCantidad() <= 0) return;
    this.lineas.update(ls => [
      ...ls,
      {
        productoId: this.addProductoId(),
        productoNombre: this.addProductoNombre(),
        cantidad: this.addProductoCantidad(),
        valorUnitario: this.addProductoValor(),
        comentario: this.addProductoObservacion(),
      },
    ]);
    this.addProductoBusqueda.set('');
    this.addProductoId.set('');
    this.addProductoNombre.set('');
    this.addProductoCantidad.set(1);
    this.addProductoValor.set(0);
    this.addProductoObservacion.set('');
  }

  eliminarLinea(i: number): void {
    this.lineas.update(ls => ls.filter((_, idx) => idx !== i));
  }

  // ─── Abonos ────────────────────────────────────────────────────────────────

  agregarAbono(): void {
    if (this.abonoFormaPagoId() === 0 || this.abonoMonto() <= 0) return;
    const fp = this.formasPago().find(f => f.formaPagoId === this.abonoFormaPagoId());
    this.abonos.update(abs => [
      ...abs,
      {
        formaPagoId: this.abonoFormaPagoId(),
        formaPagoDescripcion: fp?.descripcion ?? '',
        monto: this.abonoMonto(),
      },
    ]);
    this.abonoFormaPagoId.set(0);
    this.abonoMonto.set(0);
  }

  eliminarAbono(i: number): void {
    this.abonos.update(abs => abs.filter((_, idx) => idx !== i));
  }

  // ─── N° OT debounce ────────────────────────────────────────────────────────

  onNumeroOTChange(valor: string): void {
    this.numeroOT.set(valor);
    this.numeroOTDisponible.set(null);
    if (this.verificarTimer) clearTimeout(this.verificarTimer);
    if (!valor.trim()) return;
    this.verificarTimer = setTimeout(() => {
      this.verificandoNumero.set(true);
      this.service
        .verificarNumero(valor.trim(), this.otIdEdicion() ?? undefined)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: r => {
            this.numeroOTDisponible.set(!r.existe);
            this.verificandoNumero.set(false);
          },
          error: () => this.verificandoNumero.set(false),
        });
    }, 500);
  }

  // ─── Empresa autocomplete ──────────────────────────────────────────────────

  onEmpresaBusquedaChange(valor: string): void {
    this.empresaBusqueda.set(valor);
    this.empresaClienteId.set('');
    this.empresaDropdownAbierto.set(true);
    if (valor.trim().length >= 2) this.empresaSearch$.next(valor.trim());
    else this.resultadosEmpresa.set([]);
  }

  seleccionarEmpresa(c: Cliente): void {
    this.empresaClienteId.set(c.clienteId);
    this.empresaBusqueda.set(c.nombre);
    this.empresaDropdownAbierto.set(false);
  }

  // ─── Finalize / save ───────────────────────────────────────────────────────

  async finalizar(): Promise<void> {
    if (this.guardando()) return;
    this.guardando.set(true);

    // Step 1: create or update receta
    let recetaCristalesId: string | undefined = this.recetaCristalesIdExistente() ?? undefined;
    if (this.recetaTieneData()) {
      const r = this.receta();
      const recetaReq: CreateRecetaCristalesRequest = {
        clienteId: this.clienteId(),
        fechaIngreso: this.fechaHoy,
        lejosODEsferico: r.lejosODEsferico || undefined,
        lejosODCilindro: r.lejosODCilindro || undefined,
        lejosODEje: r.lejosODEje || undefined,
        lejosODObservacion: r.lejosODObservacion || undefined,
        lejosOIEsferico: r.lejosOIEsferico || undefined,
        lejosOICilindro: r.lejosOICilindro || undefined,
        lejosOIEje: r.lejosOIEje || undefined,
        lejosOIObservacion: r.lejosOIObservacion || undefined,
        lejosDPEsferico: r.lejosDPEsferico || undefined,
        lejosDPObservacion: r.lejosDPObservacion || undefined,
        lejosADDEsfera: r.lejosADDEsfera || undefined,
        cercaODEsferico: r.cercaODEsferico || undefined,
        cercaODCilindro: r.cercaODCilindro || undefined,
        cercaODEje: r.cercaODEje || undefined,
        cercaODObservacion: r.cercaODObservacion || undefined,
        cercaOIEsferico: r.cercaOIEsferico || undefined,
        cercaOICilindro: r.cercaOICilindro || undefined,
        cercaOIEje: r.cercaOIEje || undefined,
        cercaOIObservacion: r.cercaOIObservacion || undefined,
        cercaDPEsferico: r.cercaDPEsferico || undefined,
        cercaDPObservacion: r.cercaDPObservacion || undefined,
        checkLejos: r.incluirLejos,
        checkCerca: r.incluirCerca,
        checkCristalesLaboratorio: r.cristalesLaboratorio,
        checkUrgente: r.urgente,
      };
      try {
        const existente = this.recetaCristalesIdExistente();
        if (existente) {
          const updateReq: UpdateRecetaCristalesRequest = {
            lejosODEsferico: r.lejosODEsferico || undefined,
            lejosODCilindro: r.lejosODCilindro || undefined,
            lejosODEje: r.lejosODEje || undefined,
            lejosODObservacion: r.lejosODObservacion || undefined,
            lejosOIEsferico: r.lejosOIEsferico || undefined,
            lejosOICilindro: r.lejosOICilindro || undefined,
            lejosOIEje: r.lejosOIEje || undefined,
            lejosOIObservacion: r.lejosOIObservacion || undefined,
            lejosDPEsferico: r.lejosDPEsferico || undefined,
            lejosDPObservacion: r.lejosDPObservacion || undefined,
            lejosADDEsfera: r.lejosADDEsfera || undefined,
            cercaODEsferico: r.cercaODEsferico || undefined,
            cercaODCilindro: r.cercaODCilindro || undefined,
            cercaODEje: r.cercaODEje || undefined,
            cercaODObservacion: r.cercaODObservacion || undefined,
            cercaOIEsferico: r.cercaOIEsferico || undefined,
            cercaOICilindro: r.cercaOICilindro || undefined,
            cercaOIEje: r.cercaOIEje || undefined,
            cercaOIObservacion: r.cercaOIObservacion || undefined,
            cercaDPEsferico: r.cercaDPEsferico || undefined,
            cercaDPObservacion: r.cercaDPObservacion || undefined,
            checkLejos: r.incluirLejos,
            checkCerca: r.incluirCerca,
            checkCristalesLaboratorio: r.cristalesLaboratorio,
            checkUrgente: r.urgente,
            fechaIngreso: this.fechaHoy,
          };
          await firstValueFrom(this.recetaSvc.update(existente, updateReq));
          recetaCristalesId = existente;
        } else {
          const created = await firstValueFrom(this.recetaSvc.create(recetaReq));
          recetaCristalesId = created.id;
        }
      } catch {
        this.guardando.set(false);
        Swal.fire('Error', 'No se pudo guardar la receta de cristales. Intente nuevamente.', 'error');
        return;
      }
    }

    const lineasReq = this.lineas().map(l => ({
      productoId: l.productoId,
      cantidad: l.cantidad,
      valorUnitario: l.valorUnitario,
      comentario: l.comentario || undefined,
    }));

    if (this.modoEdicion() && this.otIdEdicion()) {
      const req: UpdateOrdenTrabajoRequest = {
        numeroOT: this.numeroOT().trim(),
        clienteId: this.clienteId(),
        beneficiario: this.beneficiario() || undefined,
        tipoFacturacion: this.tipoFacturacion(),
        empresaClienteId: this.empresaClienteId() || undefined,
        recetaCristalesId,
        fechaEntrega: this.fechaEntrega(),
        horaEntrega: this.horaEntrega() || undefined,
        descuento: this.descuento(),
        numeroCuotas: this.numeroCuotas(),
        fechaInicioCuotas: this.fechaInicioCuotas() || undefined,
        lineas: lineasReq,
      };
      this.service
        .update(this.otIdEdicion()!, req)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: () => {
            this.guardando.set(false);
            this.router.navigate(['/ordenes-trabajo', this.otIdEdicion()]);
          },
          error: (err) => {
            this.guardando.set(false);
            const msg = err?.error?.detail ?? err?.error?.title ?? 'Error al guardar la Orden de Trabajo.';
            Swal.fire('Error', msg, 'error');
          },
        });
    } else {
      const req: CreateOrdenTrabajoRequest = {
        numeroOT: this.numeroOT().trim(),
        clienteId: this.clienteId(),
        beneficiario: this.beneficiario() || undefined,
        tipoFacturacion: this.tipoFacturacion(),
        empresaClienteId: this.empresaClienteId() || undefined,
        recetaCristalesId,
        fechaEntrega: this.fechaEntrega(),
        horaEntrega: this.horaEntrega() || undefined,
        descuento: this.descuento(),
        numeroCuotas: this.numeroCuotas(),
        fechaInicioCuotas: this.fechaInicioCuotas() || undefined,
        lineas: lineasReq,
        abonos: this.abonos()
          .filter(a => a.formaPagoId > 0 && a.monto > 0)
          .map(a => ({
            formaPagoId: a.formaPagoId,
            monto: a.monto,
            fechaPago: new Date().toISOString().substring(0, 10),
          })),
      };
      this.service
        .create(req)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: r => {
            this.guardando.set(false);
            this.router.navigate(['/ordenes-trabajo', r.otId]);
          },
          error: (err) => {
            this.guardando.set(false);
            const msg = err?.error?.detail ?? err?.error?.title ?? 'Error al crear la Orden de Trabajo.';
            Swal.fire('Error', msg, 'error');
          },
        });
    }
  }

  // ─── Template helpers ──────────────────────────────────────────────────────

  getInputValue(event: Event): string {
    return (event.target as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement).value;
  }

  getCheckedValue(event: Event): boolean {
    return (event.target as HTMLInputElement).checked;
  }
}
