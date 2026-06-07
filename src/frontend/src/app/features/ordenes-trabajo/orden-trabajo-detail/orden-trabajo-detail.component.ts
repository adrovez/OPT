import {
  Component,
  inject,
  signal,
  computed,
  DestroyRef,
  OnInit,
} from '@angular/core';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CurrencyPipe, DatePipe } from '@angular/common';
import Swal from 'sweetalert2';

import { OrdenTrabajoService } from '../../../core/services/orden-trabajo.service';
import { FormaPagoService } from '../../../core/services/forma-pago.service';
import { AuthService } from '../../../core/services/auth.service';
import { ClienteService } from '../../../core/services/cliente.service';
import { RecetaCristalesService } from '../../../core/services/receta-cristales.service';
import {
  OrdenTrabajoDetalleDto,
  ETAPAS_OT,
  ETAPA_COLORS,
  EtapaOT,
  EstadoPagoOT,
  CambiarEtapaRequest,
  RegistrarPagoOTRequest,
} from '../../../core/models/orden-trabajo.model';
import { FormaPagoDto } from '../../../core/models/forma-pago.model';
import { Cliente } from '../../../core/models/cliente.model';
import { RecetaCristalesDto } from '../../../core/models/receta-cristales.model';

@Component({
  selector: 'app-orden-trabajo-detail',
  standalone: true,
  imports: [RouterLink, CurrencyPipe, DatePipe],
  template: `
    <div class="p-6" style="background: #F3F6FA; min-height: 100%">

      @if (cargando()) {
        <div class="flex items-center justify-center py-20">
          <div class="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
        </div>
      } @else if (!ot()) {
        <div class="text-center py-20 text-gray-400">
          <p class="text-lg font-medium">Orden no encontrada</p>
          <a routerLink="/ordenes-trabajo" class="text-blue-600 text-sm mt-2 inline-block hover:underline">
            Volver al listado
          </a>
        </div>
      } @else {

        <!-- ── Header (siempre visible) ───────────────────────────────────── -->
        <div class="flex items-start justify-between mb-6 flex-wrap gap-4">
          <div class="flex items-center gap-3">
            <a
              routerLink="/ordenes-trabajo"
              class="p-2 rounded-lg text-gray-500 hover:bg-white hover:text-gray-700 transition-colors"
              title="Volver"
            >
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
              </svg>
            </a>
            <div>
              <div class="flex items-center gap-3 flex-wrap">
                <h1 class="text-2xl font-bold" style="color: #0D1B3D">
                  Orden #{{ ot()!.numeroOT }}
                </h1>
                <span class="px-2.5 py-1 rounded-full text-xs font-medium {{ etapaClass(ot()!.etapaOT) }}">
                  {{ ot()!.etapaOT }}
                </span>
                <span class="px-2.5 py-1 rounded-full text-xs font-medium {{ estadoPagoClass(ot()!.estadoPago) }}">
                  {{ ot()!.estadoPago }}
                </span>
              </div>
              <p class="text-sm text-gray-500 mt-1">{{ ot()!.clienteNombre }} · {{ ot()!.sucursalNombre }}</p>
            </div>
          </div>

          <!-- Acciones del header -->
          <div class="flex items-center gap-2 flex-wrap">
            <a
              [routerLink]="['/ordenes-trabajo', ot()!.otId, 'editar']"
              class="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-gray-200 text-sm font-medium
                     text-gray-600 hover:bg-white transition-colors"
            >
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5
                     m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
              </svg>
              Editar
            </a>
            <button
              type="button"
              (click)="eliminar()"
              class="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-red-200 text-sm font-medium
                     text-red-600 hover:bg-red-50 transition-colors"
            >
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6
                     m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
              </svg>
              Eliminar
            </button>
          </div>
        </div>

        <!-- ── Tabs ───────────────────────────────────────────────────────── -->
        <div class="flex gap-1 mb-4 bg-white rounded-xl p-1 shadow-sm border border-gray-100 w-fit">
          @for (tab of tabs; track tab.key) {
            <button
              type="button"
              (click)="cambiarTab(tab.key)"
              class="px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap"
              [class.text-white]="tabActivo() === tab.key"
              [class.text-gray-600]="tabActivo() !== tab.key"
              [class.hover:bg-gray-100]="tabActivo() !== tab.key"
              [style.background]="tabActivo() === tab.key ? '#2563EB' : 'transparent'"
            >
              {{ tab.label }}
            </button>
          }
        </div>

        <!-- ══════════════════════════════════════════════════════════════════
             Tab 1 — Cabecera
        ══════════════════════════════════════════════════════════════════ -->
        @if (tabActivo() === 'cabecera') {
          <div class="space-y-4">

            <!-- Cards resumen -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

              <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                <p class="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">N° OT · Sucursal</p>
                <p class="text-lg font-bold" style="color: #0D1B3D">#{{ ot()!.numeroOT }}</p>
                <p class="text-xs text-gray-500 mt-0.5">{{ ot()!.sucursalNombre }}</p>
              </div>

              <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                <p class="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">Etapa</p>
                <span class="inline-block px-2.5 py-1 rounded-full text-sm font-semibold {{ etapaClass(ot()!.etapaOT) }}">
                  {{ ot()!.etapaOT }}
                </span>
                <div class="mt-2">
                  <button
                    type="button"
                    (click)="abrirModalEtapa()"
                    class="text-xs font-medium px-2.5 py-1 rounded-lg text-white transition-colors hover:opacity-90"
                    style="background: #06B6D4"
                  >
                    Cambiar etapa
                  </button>
                </div>
              </div>

              <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                <p class="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">Fecha entrega</p>
                <p class="text-sm font-semibold" style="color: #0D1B3D">
                  {{ ot()!.fechaEntrega | date:'dd/MM/yyyy' }}
                  @if (ot()!.horaEntrega) {
                    <span class="font-normal text-gray-500"> · {{ ot()!.horaEntrega }}</span>
                  }
                </p>
                <p class="text-xs text-gray-500 mt-0.5">Ingreso: {{ ot()!.fechaIngreso | date:'dd/MM/yyyy' }}</p>
              </div>

              <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                <p class="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">Tipo facturación</p>
                <p class="text-sm font-semibold" style="color: #0D1B3D">{{ ot()!.tipoFacturacion }}</p>
                @if (ot()!.beneficiario) {
                  <p class="text-xs text-gray-500 mt-0.5">Beneficiario: {{ ot()!.beneficiario }}</p>
                }
                @if (ot()!.empresaClienteId) {
                  <p class="text-xs text-gray-500 mt-0.5">Empresa vinculada</p>
                }
              </div>

            </div>

            <!-- Bitácora de etapas (timeline) -->
            @if (ot()!.bitacora.length > 0) {
              <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                <h3 class="text-sm font-semibold mb-4" style="color: #0D1B3D">Bitácora de etapas</h3>
                <div class="relative space-y-4">
                  <!-- línea vertical -->
                  <div class="absolute left-3 top-2 bottom-2 w-px bg-gray-200"></div>

                  @for (entrada of ot()!.bitacora; track entrada.bitacoraId; let first = $first) {
                    <div class="flex items-start gap-4 text-sm relative">
                      <div class="w-6 h-6 rounded-full flex items-center justify-center shrink-0 z-10"
                           [class.bg-blue-500]="!first"
                           [class.bg-green-500]="first"
                           style="margin-left: 0">
                        @if (first) {
                          <svg class="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/>
                          </svg>
                        } @else {
                          <div class="w-2 h-2 rounded-full bg-white"></div>
                        }
                      </div>
                      <div class="flex-1 min-w-0">
                        <div class="flex items-center gap-2 flex-wrap">
                          <span class="font-semibold" style="color: #0D1B3D">{{ entrada.etapa }}</span>
                          <span class="text-gray-400">·</span>
                          <span class="text-gray-500 text-xs">{{ entrada.fecha | date:'dd/MM/yyyy HH:mm' }}</span>
                          <span class="text-gray-400">·</span>
                          <span class="text-gray-600 text-xs">{{ entrada.responsable }}</span>
                        </div>
                        @if (entrada.observacion) {
                          <p class="text-gray-500 text-xs mt-1 italic">"{{ entrada.observacion }}"</p>
                        }
                      </div>
                    </div>
                  }
                </div>
              </div>
            } @else {
              <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center text-gray-400">
                <p class="text-sm">Sin registros en la bitácora</p>
              </div>
            }

          </div>
        }

        <!-- ══════════════════════════════════════════════════════════════════
             Tab 2 — Datos Cliente (lazy)
        ══════════════════════════════════════════════════════════════════ -->
        @if (tabActivo() === 'cliente') {
          <div class="space-y-4">

            @if (cargandoCliente()) {
              <div class="flex items-center justify-center py-16">
                <div class="w-7 h-7 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
              </div>
            } @else if (clienteData()) {
              <!-- Card datos del paciente -->
              <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                <h3 class="text-sm font-semibold mb-4" style="color: #0D1B3D">
                  Datos del {{ clienteData()!.tipoCliente === 'Empresa' ? 'cliente empresa' : 'paciente' }}
                </h3>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3 text-sm">
                  <div class="flex flex-col">
                    <span class="text-xs font-medium text-gray-400 uppercase tracking-wide mb-0.5">Nombre</span>
                    <span class="text-gray-900 font-medium">{{ clienteData()!.nombre }}</span>
                  </div>
                  <div class="flex flex-col">
                    <span class="text-xs font-medium text-gray-400 uppercase tracking-wide mb-0.5">RUT / Documento</span>
                    <span class="text-gray-900">{{ clienteData()!.numeroDocumento }}</span>
                  </div>
                  <div class="flex flex-col">
                    <span class="text-xs font-medium text-gray-400 uppercase tracking-wide mb-0.5">Tipo</span>
                    <span class="text-gray-900">{{ clienteData()!.tipoCliente }}</span>
                  </div>
                  @if (clienteData()!.celular) {
                    <div class="flex flex-col">
                      <span class="text-xs font-medium text-gray-400 uppercase tracking-wide mb-0.5">Teléfono</span>
                      <span class="text-gray-900">{{ clienteData()!.celular }}</span>
                    </div>
                  }
                  @if (clienteData()!.mail) {
                    <div class="flex flex-col">
                      <span class="text-xs font-medium text-gray-400 uppercase tracking-wide mb-0.5">Email</span>
                      <span class="text-gray-900">{{ clienteData()!.mail }}</span>
                    </div>
                  }
                  @if (clienteData()!.direccion) {
                    <div class="flex flex-col">
                      <span class="text-xs font-medium text-gray-400 uppercase tracking-wide mb-0.5">Dirección</span>
                      <span class="text-gray-900">{{ clienteData()!.direccion }}</span>
                    </div>
                  }
                  @if (clienteData()!.fechaNacimiento) {
                    <div class="flex flex-col">
                      <span class="text-xs font-medium text-gray-400 uppercase tracking-wide mb-0.5">F. Nacimiento</span>
                      <span class="text-gray-900">{{ clienteData()!.fechaNacimiento | date:'dd/MM/yyyy' }}</span>
                    </div>
                  }
                  @if (clienteData()!.tipoPrevision) {
                    <div class="flex flex-col">
                      <span class="text-xs font-medium text-gray-400 uppercase tracking-wide mb-0.5">Previsión</span>
                      <span class="text-gray-900">{{ clienteData()!.tipoPrevision }}</span>
                    </div>
                  }
                  @if (clienteData()!.giro) {
                    <div class="flex flex-col">
                      <span class="text-xs font-medium text-gray-400 uppercase tracking-wide mb-0.5">Giro</span>
                      <span class="text-gray-900">{{ clienteData()!.giro }}</span>
                    </div>
                  }
                </div>
              </div>

              <!-- Empresa vinculada (si tipoFacturacion === 'Empresa') -->
              @if (ot()!.tipoFacturacion === 'Empresa' && ot()!.empresaClienteId) {
                @if (cargandoEmpresa()) {
                  <div class="flex items-center gap-2 py-4 text-sm text-gray-400">
                    <div class="w-5 h-5 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                    Cargando datos empresa...
                  </div>
                } @else if (empresaData()) {
                  <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                    <h3 class="text-sm font-semibold mb-4" style="color: #0D1B3D">Empresa facturadora</h3>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3 text-sm">
                      <div class="flex flex-col">
                        <span class="text-xs font-medium text-gray-400 uppercase tracking-wide mb-0.5">Razón social</span>
                        <span class="text-gray-900 font-medium">{{ empresaData()!.nombre }}</span>
                      </div>
                      <div class="flex flex-col">
                        <span class="text-xs font-medium text-gray-400 uppercase tracking-wide mb-0.5">RUT</span>
                        <span class="text-gray-900">{{ empresaData()!.numeroDocumento }}</span>
                      </div>
                      @if (empresaData()!.giro) {
                        <div class="flex flex-col">
                          <span class="text-xs font-medium text-gray-400 uppercase tracking-wide mb-0.5">Giro</span>
                          <span class="text-gray-900">{{ empresaData()!.giro }}</span>
                        </div>
                      }
                      @if (empresaData()!.direccion) {
                        <div class="flex flex-col">
                          <span class="text-xs font-medium text-gray-400 uppercase tracking-wide mb-0.5">Dirección</span>
                          <span class="text-gray-900">{{ empresaData()!.direccion }}</span>
                        </div>
                      }
                    </div>
                  </div>
                }
              }

            } @else {
              <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-10 text-center text-gray-400">
                <p class="text-sm">No se pudo cargar la información del cliente</p>
              </div>
            }

          </div>
        }

        <!-- ══════════════════════════════════════════════════════════════════
             Tab 3 — Receta Cristales (lazy)
        ══════════════════════════════════════════════════════════════════ -->
        @if (tabActivo() === 'receta') {
          <div class="space-y-4">

            @if (!ot()!.recetaCristalesId) {
              <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-12 flex flex-col items-center text-gray-400">
                <svg class="w-10 h-10 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586
                       a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                </svg>
                <p class="text-sm font-medium">Sin receta vinculada</p>
                <p class="text-xs mt-1">Esta orden no tiene una receta de cristales asociada</p>
              </div>
            } @else if (cargandoReceta()) {
              <div class="flex items-center justify-center py-16">
                <div class="w-7 h-7 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
              </div>
            } @else if (recetaData()) {

              <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div class="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                  <h3 class="text-sm font-semibold" style="color: #0D1B3D">Receta de Cristales</h3>
                  <div class="flex items-center gap-2">
                    @if (recetaData()!.checkCristalesLaboratorio) {
                      <span class="px-2.5 py-1 rounded-full text-xs font-medium bg-violet-100 text-violet-700">
                        Cristales Lab.
                      </span>
                    }
                    @if (recetaData()!.checkUrgente) {
                      <span class="px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
                        Urgente
                      </span>
                    }
                  </div>
                </div>

                <!-- Tabla optométrica -->
                <div class="overflow-x-auto">
                  <table class="w-full text-sm">
                    <thead>
                      <tr style="background: #F3F6FA" class="border-b border-gray-200">
                        <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 w-24"></th>
                        <th class="px-4 py-3 text-center text-xs font-semibold text-gray-500">Esférico</th>
                        <th class="px-4 py-3 text-center text-xs font-semibold text-gray-500">Cilindro</th>
                        <th class="px-4 py-3 text-center text-xs font-semibold text-gray-500">Eje</th>
                        <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500">Observación</th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-50">

                      @if (recetaData()!.checkLejos) {
                        <tr class="hover:bg-gray-50 transition-colors">
                          <td class="px-4 py-3">
                            <span class="inline-block px-2 py-0.5 rounded text-xs font-semibold bg-blue-50 text-blue-700">L — OD</span>
                          </td>
                          <td class="px-4 py-3 text-center font-mono text-gray-900">
                            {{ recetaData()!.lejosODEsferico ?? '—' }}
                          </td>
                          <td class="px-4 py-3 text-center font-mono text-gray-900">
                            {{ recetaData()!.lejosODCilindro ?? '—' }}
                          </td>
                          <td class="px-4 py-3 text-center font-mono text-gray-900">
                            {{ recetaData()!.lejosODEje ?? '—' }}
                          </td>
                          <td class="px-4 py-3 text-gray-500 text-xs">
                            {{ recetaData()!.lejosODObservacion ?? '' }}
                          </td>
                        </tr>
                        <tr class="hover:bg-gray-50 transition-colors">
                          <td class="px-4 py-3">
                            <span class="inline-block px-2 py-0.5 rounded text-xs font-semibold bg-blue-50 text-blue-700">L — OI</span>
                          </td>
                          <td class="px-4 py-3 text-center font-mono text-gray-900">
                            {{ recetaData()!.lejosOIEsferico ?? '—' }}
                          </td>
                          <td class="px-4 py-3 text-center font-mono text-gray-900">
                            {{ recetaData()!.lejosOICilindro ?? '—' }}
                          </td>
                          <td class="px-4 py-3 text-center font-mono text-gray-900">
                            {{ recetaData()!.lejosOIEje ?? '—' }}
                          </td>
                          <td class="px-4 py-3 text-gray-500 text-xs">
                            {{ recetaData()!.lejosOIObservacion ?? '' }}
                          </td>
                        </tr>
                      }

                      @if (recetaData()!.checkCerca) {
                        <tr class="hover:bg-gray-50 transition-colors">
                          <td class="px-4 py-3">
                            <span class="inline-block px-2 py-0.5 rounded text-xs font-semibold bg-green-50 text-green-700">C — OD</span>
                          </td>
                          <td class="px-4 py-3 text-center font-mono text-gray-900">
                            {{ recetaData()!.cercaODEsferico ?? '—' }}
                          </td>
                          <td class="px-4 py-3 text-center font-mono text-gray-900">
                            {{ recetaData()!.cercaODCilindro ?? '—' }}
                          </td>
                          <td class="px-4 py-3 text-center font-mono text-gray-900">
                            {{ recetaData()!.cercaODEje ?? '—' }}
                          </td>
                          <td class="px-4 py-3 text-gray-500 text-xs">
                            {{ recetaData()!.cercaODObservacion ?? '' }}
                          </td>
                        </tr>
                        <tr class="hover:bg-gray-50 transition-colors">
                          <td class="px-4 py-3">
                            <span class="inline-block px-2 py-0.5 rounded text-xs font-semibold bg-green-50 text-green-700">C — OI</span>
                          </td>
                          <td class="px-4 py-3 text-center font-mono text-gray-900">
                            {{ recetaData()!.cercaOIEsferico ?? '—' }}
                          </td>
                          <td class="px-4 py-3 text-center font-mono text-gray-900">
                            {{ recetaData()!.cercaOICilindro ?? '—' }}
                          </td>
                          <td class="px-4 py-3 text-center font-mono text-gray-900">
                            {{ recetaData()!.cercaOIEje ?? '—' }}
                          </td>
                          <td class="px-4 py-3 text-gray-500 text-xs">
                            {{ recetaData()!.cercaOIObservacion ?? '' }}
                          </td>
                        </tr>
                      }

                    </tbody>
                  </table>
                </div>

                <!-- DP y ADD -->
                <div class="px-5 py-4 border-t border-gray-100 flex flex-wrap gap-6 text-sm">
                  @if (recetaData()!.checkLejos && recetaData()!.lejosDPEsferico) {
                    <div class="flex flex-col">
                      <span class="text-xs font-medium text-gray-400 uppercase tracking-wide mb-0.5">Lejos DP</span>
                      <span class="font-mono text-gray-900">{{ recetaData()!.lejosDPEsferico }}</span>
                    </div>
                  }
                  @if (recetaData()!.checkCerca && recetaData()!.cercaDPEsferico) {
                    <div class="flex flex-col">
                      <span class="text-xs font-medium text-gray-400 uppercase tracking-wide mb-0.5">Cerca DP</span>
                      <span class="font-mono text-gray-900">{{ recetaData()!.cercaDPEsferico }}</span>
                    </div>
                  }
                  @if (recetaData()!.lejosADDEsfera) {
                    <div class="flex flex-col">
                      <span class="text-xs font-medium text-gray-400 uppercase tracking-wide mb-0.5">ADD</span>
                      <span class="font-mono text-gray-900">{{ recetaData()!.lejosADDEsfera }}</span>
                    </div>
                  }
                  <div class="flex flex-col">
                    <span class="text-xs font-medium text-gray-400 uppercase tracking-wide mb-0.5">Fecha ingreso</span>
                    <span class="text-gray-900">{{ recetaData()!.fechaIngreso | date:'dd/MM/yyyy' }}</span>
                  </div>
                </div>

                <!-- Link a atención -->
                @if (ot()!.atencionId) {
                  <div class="px-5 py-3 border-t border-gray-100 bg-gray-50">
                    <a
                      [routerLink]="['/atenciones', ot()!.atencionId]"
                      class="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-800 font-medium"
                    >
                      Ver atención completa
                      <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/>
                      </svg>
                    </a>
                  </div>
                }

              </div>

            } @else {
              <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-10 text-center text-gray-400">
                <p class="text-sm">No se pudo cargar la receta</p>
              </div>
            }

          </div>
        }

        <!-- ══════════════════════════════════════════════════════════════════
             Tab 4 — Detalle OT
        ══════════════════════════════════════════════════════════════════ -->
        @if (tabActivo() === 'detalle') {
          <div class="space-y-4">

            <!-- Tabla de líneas -->
            <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div class="px-4 py-3 border-b border-gray-100">
                <h3 class="text-sm font-semibold" style="color: #0D1B3D">Líneas de trabajo</h3>
              </div>

              @if (ot()!.lineas.length === 0) {
                <p class="text-sm text-gray-400 text-center py-8">Sin líneas registradas</p>
              } @else {
                <table class="w-full text-sm">
                  <thead>
                    <tr class="border-b border-gray-100" style="background: #F3F6FA">
                      <th class="px-4 py-2 text-left text-xs font-semibold text-gray-500">Producto</th>
                      <th class="px-4 py-2 text-right text-xs font-semibold text-gray-500">Cant.</th>
                      <th class="px-4 py-2 text-right text-xs font-semibold text-gray-500">P. Unit.</th>
                      <th class="px-4 py-2 text-right text-xs font-semibold text-gray-500">Total</th>
                      <th class="px-4 py-2 text-left text-xs font-semibold text-gray-500">Comentario</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-gray-50">
                    @for (linea of ot()!.lineas; track linea.lineaId) {
                      <tr class="hover:bg-gray-50 transition-colors">
                        <td class="px-4 py-2.5 text-gray-900 font-medium">{{ linea.productoNombre }}</td>
                        <td class="px-4 py-2.5 text-right text-gray-600">{{ linea.cantidad }}</td>
                        <td class="px-4 py-2.5 text-right text-gray-600">
                          {{ linea.valorUnitario | currency:'CLP':'symbol-narrow':'1.0-0' }}
                        </td>
                        <td class="px-4 py-2.5 text-right font-semibold" style="color: #0D1B3D">
                          {{ linea.cantidad * linea.valorUnitario | currency:'CLP':'symbol-narrow':'1.0-0' }}
                        </td>
                        <td class="px-4 py-2.5 text-gray-500 text-xs">{{ linea.comentario ?? '—' }}</td>
                      </tr>
                    }
                  </tbody>
                </table>
              }

              <!-- Resumen financiero -->
              <div class="px-4 py-4 border-t border-gray-100">
                <div class="flex justify-end">
                  <div class="w-64 space-y-2">
                    <div class="flex justify-between text-sm text-gray-600">
                      <span>Subtotal:</span>
                      <span>{{ ot()!.subTotal | currency:'CLP':'symbol-narrow':'1.0-0' }}</span>
                    </div>
                    <div class="flex justify-between text-sm text-gray-600">
                      <span>Descuento:</span>
                      <span class="text-orange-600">
                        - {{ ot()!.descuento | currency:'CLP':'symbol-narrow':'1.0-0' }}
                      </span>
                    </div>
                    <div class="flex justify-between text-base font-bold border-t border-gray-200 pt-2" style="color: #0D1B3D">
                      <span>Total:</span>
                      <span>{{ ot()!.montoTotal | currency:'CLP':'symbol-narrow':'1.0-0' }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        }

        <!-- ══════════════════════════════════════════════════════════════════
             Tab 5 — Forma de Pago
        ══════════════════════════════════════════════════════════════════ -->
        @if (tabActivo() === 'pagos') {
          <div class="space-y-4">

            <!-- Resumen financiero -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-4 text-center">
                <p class="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">Total</p>
                <p class="text-xl font-bold" style="color: #0D1B3D">
                  {{ ot()!.montoTotal | currency:'CLP':'symbol-narrow':'1.0-0' }}
                </p>
              </div>
              <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-4 text-center">
                <p class="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">Abonado</p>
                <p class="text-xl font-bold text-green-600">
                  {{ ot()!.totalAbonado | currency:'CLP':'symbol-narrow':'1.0-0' }}
                </p>
              </div>
              <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-4 text-center">
                <p class="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">Saldo</p>
                <p class="text-xl font-bold"
                   [class.text-red-600]="ot()!.saldo > 0"
                   [class.text-green-600]="ot()!.saldo === 0">
                  {{ ot()!.saldo | currency:'CLP':'symbol-narrow':'1.0-0' }}
                </p>
              </div>
            </div>

            <!-- Botón Registrar Pago -->
            <div class="flex justify-end">
              <button
                type="button"
                (click)="abrirModalPago()"
                class="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold text-white transition-colors hover:opacity-90"
                style="background: #10B981"
              >
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"/>
                </svg>
                Registrar Pago
              </button>
            </div>

            <!-- Historial de pagos -->
            <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div class="px-4 py-3 border-b border-gray-100">
                <h3 class="text-sm font-semibold" style="color: #0D1B3D">Historial de pagos</h3>
              </div>
              @if (ot()!.pagos.length === 0) {
                <p class="text-sm text-gray-400 text-center py-8">Sin pagos registrados</p>
              } @else {
                <table class="w-full text-sm">
                  <thead>
                    <tr class="border-b border-gray-100" style="background: #F3F6FA">
                      <th class="px-4 py-2 text-left text-xs font-semibold text-gray-500">Fecha</th>
                      <th class="px-4 py-2 text-left text-xs font-semibold text-gray-500">Forma Pago</th>
                      <th class="px-4 py-2 text-right text-xs font-semibold text-gray-500">Monto</th>
                      <th class="px-4 py-2 text-left text-xs font-semibold text-gray-500">Tipo</th>
                      <th class="px-4 py-2 text-left text-xs font-semibold text-gray-500">Observación</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-gray-50">
                    @for (pago of ot()!.pagos; track pago.pagoId) {
                      <tr class="hover:bg-gray-50 transition-colors">
                        <td class="px-4 py-2.5 text-gray-600">{{ pago.fechaPago | date:'dd/MM/yyyy' }}</td>
                        <td class="px-4 py-2.5 text-gray-900">{{ pago.formaPagoDescripcion }}</td>
                        <td class="px-4 py-2.5 text-right font-semibold text-green-700">
                          {{ pago.monto | currency:'CLP':'symbol-narrow':'1.0-0' }}
                        </td>
                        <td class="px-4 py-2.5">
                          <span class="px-2 py-0.5 rounded-full text-xs font-medium"
                                [class.bg-blue-100]="pago.esAbono"
                                [class.text-blue-700]="pago.esAbono"
                                [class.bg-green-100]="!pago.esAbono"
                                [class.text-green-700]="!pago.esAbono">
                            {{ pago.esAbono ? 'Abono' : 'Pago' }}
                          </span>
                        </td>
                        <td class="px-4 py-2.5 text-gray-500 text-xs">{{ pago.observacion ?? '—' }}</td>
                      </tr>
                    }
                  </tbody>
                </table>
              }
            </div>

            <!-- Plan de cuotas -->
            @if (ot()!.numeroCuotas > 0 && ot()!.cuotas.length > 0) {
              <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div class="px-4 py-3 border-b border-gray-100">
                  <h3 class="text-sm font-semibold" style="color: #0D1B3D">
                    Plan de cuotas ({{ ot()!.numeroCuotas }} cuota{{ ot()!.numeroCuotas > 1 ? 's' : '' }})
                  </h3>
                </div>
                <table class="w-full text-sm">
                  <thead>
                    <tr class="border-b border-gray-100" style="background: #F3F6FA">
                      <th class="px-4 py-2 text-left text-xs font-semibold text-gray-500">N°</th>
                      <th class="px-4 py-2 text-left text-xs font-semibold text-gray-500">Vencimiento</th>
                      <th class="px-4 py-2 text-right text-xs font-semibold text-gray-500">Valor</th>
                      <th class="px-4 py-2 text-left text-xs font-semibold text-gray-500">Estado</th>
                      <th class="px-4 py-2 text-left text-xs font-semibold text-gray-500">F. Pago</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-gray-50">
                    @for (cuota of ot()!.cuotas; track cuota.cuotaId) {
                      <tr class="hover:bg-gray-50 transition-colors">
                        <td class="px-4 py-2.5 text-gray-600">{{ cuota.numero }}</td>
                        <td class="px-4 py-2.5 text-gray-600">{{ cuota.fechaVencimiento | date:'dd/MM/yyyy' }}</td>
                        <td class="px-4 py-2.5 text-right font-semibold" style="color: #0D1B3D">
                          {{ cuota.valorCuota | currency:'CLP':'symbol-narrow':'1.0-0' }}
                        </td>
                        <td class="px-4 py-2.5">
                          <span class="px-2 py-0.5 rounded-full text-xs font-medium"
                                [class.bg-green-100]="cuota.estado === 'Pagada'"
                                [class.text-green-700]="cuota.estado === 'Pagada'"
                                [class.bg-yellow-100]="cuota.estado === 'Pendiente'"
                                [class.text-yellow-700]="cuota.estado === 'Pendiente'">
                            {{ cuota.estado }}
                          </span>
                        </td>
                        <td class="px-4 py-2.5 text-gray-500 text-xs">
                          {{ cuota.fechaPago ? (cuota.fechaPago | date:'dd/MM/yyyy') : '—' }}
                        </td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            }

          </div>
        }

        <!-- ══════════════════════════════════════════════════════════════════
             Modal — Cambiar Etapa
        ══════════════════════════════════════════════════════════════════ -->
        @if (modalEtapaAbierto()) {
          <div class="fixed inset-0 z-50 flex items-center justify-center p-4" style="background: rgba(0,0,0,0.4)">
            <div class="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
              <h2 class="text-lg font-bold mb-4" style="color: #0D1B3D">Cambiar etapa de la OT</h2>

              <div class="space-y-4">
                <div>
                  <label class="block text-xs font-medium text-gray-500 mb-1">Nueva etapa *</label>
                  <select
                    [value]="nuevaEtapa()"
                    (change)="nuevaEtapa.set(getInputValue($event))"
                    class="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    <option value="">Seleccionar etapa...</option>
                    @for (etapa of etapas; track etapa) {
                      <option [value]="etapa" [disabled]="etapa === ot()!.etapaOT">{{ etapa }}</option>
                    }
                  </select>
                </div>
                <div>
                  <label class="block text-xs font-medium text-gray-500 mb-1">Observación (opcional)</label>
                  <textarea
                    [value]="observacionEtapa()"
                    (input)="observacionEtapa.set(getInputValue($event))"
                    rows="3"
                    placeholder="Observación del cambio de etapa..."
                    class="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  ></textarea>
                </div>
              </div>

              <div class="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  (click)="cerrarModalEtapa()"
                  class="px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  (click)="confirmarEtapa()"
                  [disabled]="!nuevaEtapa() || guardandoEtapa()"
                  class="px-4 py-2 rounded-lg text-sm font-semibold text-white transition-colors disabled:opacity-50 hover:opacity-90"
                  style="background: #06B6D4"
                >
                  @if (guardandoEtapa()) {
                    <span class="flex items-center gap-2">
                      <div class="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin"></div>
                      Cambiando...
                    </span>
                  } @else {
                    Confirmar
                  }
                </button>
              </div>
            </div>
          </div>
        }

        <!-- ══════════════════════════════════════════════════════════════════
             Modal — Registrar Pago
        ══════════════════════════════════════════════════════════════════ -->
        @if (modalPagoAbierto()) {
          <div class="fixed inset-0 z-50 flex items-center justify-center p-4" style="background: rgba(0,0,0,0.4)">
            <div class="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
              <h2 class="text-lg font-bold mb-4" style="color: #0D1B3D">Registrar pago</h2>

              <div class="space-y-4">
                <div>
                  <label class="block text-xs font-medium text-gray-500 mb-1">Forma de pago *</label>
                  <select
                    [value]="pagoFormaPagoId()"
                    (change)="pagoFormaPagoId.set(+getInputValue($event))"
                    class="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    <option value="0">Seleccionar...</option>
                    @for (fp of formasPago(); track fp.formaPagoId) {
                      <option [value]="fp.formaPagoId">{{ fp.descripcion }}</option>
                    }
                  </select>
                </div>
                <div>
                  <label class="block text-xs font-medium text-gray-500 mb-1">Monto *</label>
                  <input
                    type="number"
                    [value]="pagoMonto()"
                    (input)="pagoMonto.set(+getInputValue($event))"
                    min="1"
                    class="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label class="block text-xs font-medium text-gray-500 mb-1">Fecha *</label>
                  <input
                    type="date"
                    [value]="pagoFecha()"
                    (input)="pagoFecha.set(getInputValue($event))"
                    class="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label class="block text-xs font-medium text-gray-500 mb-1">Observación (opcional)</label>
                  <input
                    type="text"
                    [value]="pagoObservacion()"
                    (input)="pagoObservacion.set(getInputValue($event))"
                    placeholder="Opcional..."
                    class="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div class="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  (click)="cerrarModalPago()"
                  class="px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  (click)="confirmarPago()"
                  [disabled]="!pagoValido() || guardandoPago()"
                  class="px-4 py-2 rounded-lg text-sm font-semibold text-white transition-colors disabled:opacity-50 hover:opacity-90"
                  style="background: #10B981"
                >
                  @if (guardandoPago()) {
                    <span class="flex items-center gap-2">
                      <div class="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin"></div>
                      Registrando...
                    </span>
                  } @else {
                    Registrar
                  }
                </button>
              </div>
            </div>
          </div>
        }

      }
    </div>
  `,
})
export class OrdenTrabajoDetailComponent implements OnInit {
  private readonly service          = inject(OrdenTrabajoService);
  private readonly formaPagoSvc     = inject(FormaPagoService);
  private readonly authService      = inject(AuthService);
  private readonly clienteSvc       = inject(ClienteService);
  private readonly recetaSvc        = inject(RecetaCristalesService);
  private readonly router           = inject(Router);
  private readonly route            = inject(ActivatedRoute);
  private readonly destroyRef       = inject(DestroyRef);

  readonly etapas = ETAPAS_OT;

  readonly tabs = [
    { key: 'cabecera', label: 'Cabecera' },
    { key: 'cliente',  label: 'Datos Cliente' },
    { key: 'receta',   label: 'Receta Cristales' },
    { key: 'detalle',  label: 'Detalle OT' },
    { key: 'pagos',    label: 'Forma Pago' },
  ];

  // ─── Estado principal ─────────────────────────────────────────────────────
  readonly cargando   = signal(true);
  readonly ot         = signal<OrdenTrabajoDetalleDto | null>(null);
  readonly tabActivo  = signal('cabecera');
  readonly formasPago = signal<FormaPagoDto[]>([]);

  // ─── Lazy: cliente ────────────────────────────────────────────────────────
  readonly clienteData     = signal<Cliente | null>(null);
  readonly cargandoCliente = signal(false);
  readonly empresaData     = signal<Cliente | null>(null);
  readonly cargandoEmpresa = signal(false);

  // ─── Lazy: receta ─────────────────────────────────────────────────────────
  readonly recetaData     = signal<RecetaCristalesDto | null>(null);
  readonly cargandoReceta = signal(false);

  // ─── Modal etapa ─────────────────────────────────────────────────────────
  readonly modalEtapaAbierto = signal(false);
  readonly nuevaEtapa        = signal('');
  readonly observacionEtapa  = signal('');
  readonly guardandoEtapa    = signal(false);

  // ─── Modal pago ───────────────────────────────────────────────────────────
  readonly modalPagoAbierto = signal(false);
  readonly pagoFormaPagoId  = signal(0);
  readonly pagoMonto        = signal(0);
  readonly pagoFecha        = signal(this.hoy());
  readonly pagoObservacion  = signal('');
  readonly guardandoPago    = signal(false);

  readonly pagoValido = computed(
    () => this.pagoFormaPagoId() > 0 && this.pagoMonto() > 0 && this.pagoFecha().length > 0,
  );

  // ─── Ciclo de vida ────────────────────────────────────────────────────────

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.router.navigate(['/ordenes-trabajo']);
      return;
    }

    this.formaPagoSvc.getAll()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(fps => this.formasPago.set(fps));

    this.cargar(id);
  }

  private cargar(id: string): void {
    this.cargando.set(true);
    this.service.getById(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (ot) => {
          this.ot.set(ot);
          this.cargando.set(false);
        },
        error: () => {
          this.ot.set(null);
          this.cargando.set(false);
        },
      });
  }

  private recargar(): void {
    const id = this.ot()?.otId;
    if (id) this.cargar(id);
  }

  // ─── Cambio de tab con lazy loading ──────────────────────────────────────

  cambiarTab(key: string): void {
    this.tabActivo.set(key);

    if (key === 'cliente' && !this.clienteData() && !this.cargandoCliente()) {
      this.cargarCliente();
    }
    if (key === 'receta' && !this.recetaData() && !this.cargandoReceta() && this.ot()?.recetaCristalesId) {
      this.cargarReceta();
    }
  }

  private cargarCliente(): void {
    const ot = this.ot();
    if (!ot) return;

    this.cargandoCliente.set(true);
    this.clienteSvc.getCliente(ot.clienteId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (c) => {
          this.clienteData.set(c);
          this.cargandoCliente.set(false);
          // Si hay empresa vinculada, cargarla también
          if (ot.tipoFacturacion === 'Empresa' && ot.empresaClienteId && !this.empresaData()) {
            this.cargarEmpresa(ot.empresaClienteId);
          }
        },
        error: () => {
          this.cargandoCliente.set(false);
        },
      });
  }

  private cargarEmpresa(empresaId: string): void {
    this.cargandoEmpresa.set(true);
    this.clienteSvc.getCliente(empresaId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (e) => {
          this.empresaData.set(e);
          this.cargandoEmpresa.set(false);
        },
        error: () => {
          this.cargandoEmpresa.set(false);
        },
      });
  }

  private cargarReceta(): void {
    const recetaId = this.ot()?.recetaCristalesId;
    if (!recetaId) return;

    this.cargandoReceta.set(true);
    this.recetaSvc.getById(recetaId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (r) => {
          this.recetaData.set(r);
          this.cargandoReceta.set(false);
        },
        error: () => {
          this.cargandoReceta.set(false);
        },
      });
  }

  // ─── Helpers de estilo ────────────────────────────────────────────────────

  etapaClass(etapa: EtapaOT): string {
    return ETAPA_COLORS[etapa] ?? 'bg-gray-100 text-gray-700';
  }

  estadoPagoClass(estado: EstadoPagoOT): string {
    return estado === 'Pagado' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700';
  }

  // ─── Acción: eliminar ─────────────────────────────────────────────────────

  eliminar(): void {
    const ot = this.ot();
    if (!ot) return;
    Swal.fire({
      title: '¿Eliminar orden?',
      text: `Se eliminará la OT ${ot.numeroOT}.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#EF4444',
    }).then((result) => {
      if (!result.isConfirmed) return;
      this.service
        .remove(ot.otId)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: () => this.router.navigate(['/ordenes-trabajo']),
          error: () => Swal.fire('Error', 'No se pudo eliminar la orden.', 'error'),
        });
    });
  }

  // ─── Modal Etapa ──────────────────────────────────────────────────────────

  abrirModalEtapa(): void {
    this.nuevaEtapa.set('');
    this.observacionEtapa.set('');
    this.modalEtapaAbierto.set(true);
  }

  cerrarModalEtapa(): void {
    this.modalEtapaAbierto.set(false);
  }

  confirmarEtapa(): void {
    const ot = this.ot();
    if (!ot || !this.nuevaEtapa() || this.guardandoEtapa()) return;
    this.guardandoEtapa.set(true);

    const responsable = this.authService.currentUser()?.nombre ?? 'Sistema';
    const req: CambiarEtapaRequest = {
      nuevaEtapa: this.nuevaEtapa() as EtapaOT,
      responsable,
      observacion: this.observacionEtapa() || undefined,
    };

    this.service
      .cambiarEtapa(ot.otId, req)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.guardandoEtapa.set(false);
          this.modalEtapaAbierto.set(false);
          this.recargar();
        },
        error: () => {
          this.guardandoEtapa.set(false);
          Swal.fire('Error', 'No se pudo cambiar la etapa.', 'error');
        },
      });
  }

  // ─── Modal Pago ───────────────────────────────────────────────────────────

  abrirModalPago(): void {
    this.pagoFormaPagoId.set(0);
    this.pagoMonto.set(0);
    this.pagoFecha.set(this.hoy());
    this.pagoObservacion.set('');
    this.modalPagoAbierto.set(true);
  }

  cerrarModalPago(): void {
    this.modalPagoAbierto.set(false);
  }

  confirmarPago(): void {
    const ot = this.ot();
    if (!ot || !this.pagoValido() || this.guardandoPago()) return;
    this.guardandoPago.set(true);

    const req: RegistrarPagoOTRequest = {
      formaPagoId: this.pagoFormaPagoId(),
      monto: this.pagoMonto(),
      fechaPago: this.pagoFecha(),
      observacion: this.pagoObservacion() || undefined,
    };

    this.service
      .registrarPago(ot.otId, req)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.guardandoPago.set(false);
          this.modalPagoAbierto.set(false);
          this.recargar();
        },
        error: () => {
          this.guardandoPago.set(false);
          Swal.fire('Error', 'No se pudo registrar el pago.', 'error');
        },
      });
  }

  // ─── Utilidades ───────────────────────────────────────────────────────────

  getInputValue(event: Event): string {
    return (event.target as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement).value;
  }

  private hoy(): string {
    return new Date().toISOString().substring(0, 10);
  }
}
