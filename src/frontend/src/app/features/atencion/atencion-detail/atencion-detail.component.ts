import { Component, inject, signal, computed, OnInit, DestroyRef } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AtencionDto, EstadoAtencion } from '../../../core/models/atencion.model';
import { AnamnesisDto } from '../../../core/models/anamnesis.model';
import { RecetaCristalesDto } from '../../../core/models/receta-cristales.model';
import { FormaPagoDto } from '../../../core/models/forma-pago.model';
import { AtencionService } from '../../../core/services/atencion.service';
import { AnamnesisService } from '../../../core/services/anamnesis.service';
import { RecetaCristalesService } from '../../../core/services/receta-cristales.service';
import { FormaPagoService } from '../../../core/services/forma-pago.service';
import { RecetaCristalesFormComponent, RecetaState, RECETA_EMPTY } from '../receta-cristales-form/receta-cristales-form.component';
import Swal from 'sweetalert2';

type TabType = 'informacion' | 'anamnesis' | 'receta' | 'cobro';

const ESTADO_BADGE: Record<EstadoAtencion, string> = {
  Abierta:   'bg-blue-50 text-blue-700 border border-blue-200',
  Terminada: 'bg-amber-50 text-amber-700 border border-amber-200',
  Pagada:    'bg-green-50 text-green-700 border border-green-200',
  DerivoOT:  'bg-purple-50 text-purple-700 border border-purple-200',
};

const ESTADO_LABEL: Record<EstadoAtencion, string> = {
  Abierta: 'Abierta', Terminada: 'Terminada', Pagada: 'Pagada', DerivoOT: 'Derivó a OT',
};

function pad(n: number): string { return String(n).padStart(2, '0'); }

function formatFecha(iso: string): string {
  const d = new Date(iso);
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

@Component({
  selector: 'app-atencion-detail',
  standalone: true,
  imports: [RecetaCristalesFormComponent],
  template: `
    <div class="flex flex-col h-full bg-gray-50">

      <!-- Header -->
      <div class="flex items-center gap-4 px-6 py-4 bg-white border-b border-gray-100 shrink-0">
        <button type="button" (click)="volver()"
          class="text-gray-400 hover:text-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300 rounded-lg p-1"
          aria-label="Volver">
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
          </svg>
        </button>
        <div class="flex-1">
          <div class="flex items-center gap-3">
            <h1 class="text-lg font-semibold text-gray-900">Atención</h1>
            @if (atencion()) {
              <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold
                           {{ estadoBadge(atencion()!.estado) }}">
                {{ estadoLabel(atencion()!.estado) }}
              </span>
            }
          </div>
          @if (atencion()) {
            <p class="text-xs text-gray-400 mt-0.5">
              {{ atencion()!.clienteNombre }} · {{ fmtFecha(atencion()!.fechaHoraAtencion) }}
            </p>
          }
        </div>
        @if (loading() || actionLoading()) {
          <svg class="w-4 h-4 animate-spin text-blue-500" fill="none" viewBox="0 0 24 24" aria-hidden="true">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
          </svg>
        }
      </div>

      <!-- Loading inicial -->
      @if (loading() && !atencion()) {
        <div class="flex items-center justify-center flex-1">
          <svg class="w-8 h-8 animate-spin text-blue-500" fill="none" viewBox="0 0 24 24" aria-hidden="true">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
          </svg>
        </div>
      }

      @if (!loading() || atencion()) {

        <!-- Tabs -->
        <div class="flex border-b border-gray-200 bg-white px-6 shrink-0 overflow-x-auto">
          <button type="button" (click)="switchTab('informacion')" [class]="tabClass('informacion')">
            Información
          </button>
          <button type="button" (click)="switchTab('anamnesis')" [class]="tabClass('anamnesis')">
            Anamnesis
          </button>
          <button type="button" (click)="switchTab('receta')" [class]="tabClass('receta')">
            Receta Cristales
          </button>
          <button type="button" (click)="switchTab('cobro')"
                  [disabled]="atencion()?.estado !== 'Terminada' && atencion()?.estado !== 'Pagada'"
                  [class]="tabClass('cobro')">
            Cobro
            @if (atencion()?.estado === 'Abierta') {
              <span class="ml-1.5 text-[10px] opacity-60">(requiere terminar)</span>
            }
          </button>
        </div>

        <!-- Contenido -->
        <div class="flex-1 overflow-auto p-6">

          <!-- Tab: Información -->
          @if (activeTab() === 'informacion' && atencion()) {
            <div class="max-w-xl mx-auto space-y-4">
              <div class="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-4">
                <div class="grid grid-cols-2 gap-x-8 gap-y-4">
                  <div>
                    <p class="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">Cliente</p>
                    <p class="text-sm text-gray-900 font-medium">{{ atencion()!.clienteNombre }}</p>
                  </div>
                  <div>
                    <p class="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">Profesional</p>
                    <p class="text-sm text-gray-700">{{ atencion()!.usuarioAtencionNombre }}</p>
                  </div>
                  <div>
                    <p class="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">Fecha y hora</p>
                    <p class="text-sm text-gray-700">{{ fmtFecha(atencion()!.fechaHoraAtencion) }}</p>
                  </div>
                  <div>
                    <p class="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">Sucursal</p>
                    <p class="text-sm text-gray-700">{{ atencion()!.sucursalNombre }}</p>
                  </div>
                </div>
                <div class="border-t border-gray-100 pt-4">
                  <p class="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">Motivo</p>
                  <p class="text-sm text-gray-900">{{ atencion()!.motivo }}</p>
                </div>
                @if (atencion()!.observaciones) {
                  <div>
                    <p class="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">Observaciones</p>
                    <p class="text-sm text-gray-700 whitespace-pre-line">{{ atencion()!.observaciones }}</p>
                  </div>
                }
                <div class="border-t border-gray-100 pt-3">
                  <p class="text-xs text-gray-400">Registrada el {{ fmtFecha(atencion()!.createdAt) }}</p>
                </div>
              </div>

              @if (atencion()!.estado === 'Abierta') {
                <div class="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                  <p class="text-sm font-medium text-gray-700 mb-4">Acciones</p>
                  <div class="flex gap-3">
                    <button type="button" (click)="terminar()" [disabled]="actionLoading()"
                      class="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white
                             bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed
                             rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                      <svg class="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                      </svg>
                      Terminar servicio
                    </button>
                    <button type="button" (click)="derivarAOT()" [disabled]="actionLoading()"
                      class="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white
                             bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 disabled:cursor-not-allowed
                             rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2">
                      <svg class="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"/>
                      </svg>
                      Derivar a OT
                    </button>
                  </div>
                </div>
              }
            </div>
          }

          <!-- Tab: Anamnesis -->
          @if (activeTab() === 'anamnesis') {
            <div class="max-w-xl mx-auto">
              @if (anamnesisLoading()) {
                <div class="flex items-center justify-center py-16">
                  <svg class="w-6 h-6 animate-spin text-blue-500" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                </div>
              } @else if (!atencion()?.anamnesisId) {
                <div class="flex flex-col items-center justify-center py-16 text-gray-400 gap-2">
                  <p class="text-sm">No hay anamnesis registrada para esta atención.</p>
                </div>
              } @else if (anamnesisData()) {
                <div class="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-5">
                  <div class="flex items-center justify-between">
                    <p class="text-sm font-medium text-gray-700">Antecedentes del paciente</p>
                    @if (esNoEditable()) {
                      <span class="inline-flex items-center gap-1.5 text-xs text-amber-600 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full">
                        <svg class="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m0-6v2m-6 4h12a2 2 0 002-2V7a2 2 0 00-2-2H6a2 2 0 00-2 2v8a2 2 0 002 2z"/>
                        </svg>
                        Solo lectura
                      </span>
                    }
                  </div>

                  <div class="grid grid-cols-2 gap-3">
                    <label class="flex items-center gap-3 p-3 rounded-lg border transition-colors"
                           [class.cursor-pointer]="!esNoEditable()" [class.cursor-default]="esNoEditable()"
                           [class.border-blue-300]="anaHipertension()" [class.bg-blue-50]="anaHipertension()"
                           [class.border-gray-200]="!anaHipertension()">
                      <input type="checkbox" [checked]="anaHipertension()" (change)="anaHipertension.set($any($event.target).checked)"
                             [disabled]="esNoEditable()"
                             class="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-default"/>
                      <span class="text-sm text-gray-700">Hipertensión</span>
                    </label>
                    <label class="flex items-center gap-3 p-3 rounded-lg border transition-colors"
                           [class.cursor-pointer]="!esNoEditable()" [class.cursor-default]="esNoEditable()"
                           [class.border-blue-300]="anaDiabetes()" [class.bg-blue-50]="anaDiabetes()"
                           [class.border-gray-200]="!anaDiabetes()">
                      <input type="checkbox" [checked]="anaDiabetes()" (change)="anaDiabetes.set($any($event.target).checked)"
                             [disabled]="esNoEditable()"
                             class="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-default"/>
                      <span class="text-sm text-gray-700">Diabetes</span>
                    </label>
                    <label class="flex items-center gap-3 p-3 rounded-lg border transition-colors"
                           [class.cursor-pointer]="!esNoEditable()" [class.cursor-default]="esNoEditable()"
                           [class.border-blue-300]="anaAlergias()" [class.bg-blue-50]="anaAlergias()"
                           [class.border-gray-200]="!anaAlergias()">
                      <input type="checkbox" [checked]="anaAlergias()" (change)="anaAlergias.set($any($event.target).checked)"
                             [disabled]="esNoEditable()"
                             class="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-default"/>
                      <span class="text-sm text-gray-700">Alergias</span>
                    </label>
                    <label class="flex items-center gap-3 p-3 rounded-lg border transition-colors"
                           [class.cursor-pointer]="!esNoEditable()" [class.cursor-default]="esNoEditable()"
                           [class.border-blue-300]="anaUsaLentes()" [class.bg-blue-50]="anaUsaLentes()"
                           [class.border-gray-200]="!anaUsaLentes()">
                      <input type="checkbox" [checked]="anaUsaLentes()" (change)="anaUsaLentes.set($any($event.target).checked)"
                             [disabled]="esNoEditable()"
                             class="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-default"/>
                      <span class="text-sm text-gray-700">Usa lentes</span>
                    </label>
                  </div>

                  <div>
                    <label for="det-ana-obs" class="block text-sm font-medium text-gray-700 mb-1.5">
                      Observaciones <span class="text-gray-400 font-normal">(opcional)</span>
                    </label>
                    <textarea id="det-ana-obs" rows="3" maxlength="2000"
                              [value]="anaObservacion()" (input)="anaObservacion.set($any($event.target).value)"
                              [disabled]="esNoEditable()"
                              class="w-full px-3.5 py-2.5 text-sm rounded-lg border border-gray-200
                                     bg-white transition-colors resize-none focus:outline-none focus:ring-2
                                     focus:ring-blue-500 focus:border-transparent
                                     disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-default"></textarea>
                  </div>

                  @if (!esNoEditable()) {
                    <div class="flex justify-end pt-1">
                      <button type="button" (click)="guardarAnamnesis()" [disabled]="anamnesisSaving()"
                        class="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white
                               bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed
                               rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                        @if (anamnesisSaving()) {
                          <svg class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                          </svg>
                        }
                        Guardar cambios
                      </button>
                    </div>
                  }
                </div>
              }
            </div>
          }

          <!-- Tab: Receta Cristales -->
          @if (activeTab() === 'receta') {
            <div class="max-w-4xl mx-auto space-y-4">
              @if (recetaLoading()) {
                <div class="flex items-center justify-center py-16">
                  <svg class="w-6 h-6 animate-spin text-blue-500" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                </div>
              } @else if (!atencion()?.recetaCristalesId) {
                <div class="flex flex-col items-center justify-center py-16 text-gray-400 gap-2">
                  <p class="text-sm">No hay receta de cristales registrada para esta atención.</p>
                </div>
              } @else if (recetaData()) {

                <app-receta-cristales-form [(value)]="recetaEdit" [disabled]="esNoEditable()" />

                <!-- Guardar receta -->
                @if (!esNoEditable()) {
                  <div class="flex justify-end">
                    <button type="button" (click)="guardarReceta()" [disabled]="recetaSaving()"
                      class="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white
                             bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed
                             rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                      @if (recetaSaving()) {
                        <svg class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                        </svg>
                      }
                      Guardar cambios
                    </button>
                  </div>
                }

              }
            </div>
          }

          <!-- Tab: Cobro -->
          @if (activeTab() === 'cobro' && atencion()) {
            <div class="max-w-xl mx-auto">
              @if (atencion()!.cobroServicio) {
                <div class="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-4">
                  <div class="flex items-center gap-2">
                    <svg class="w-5 h-5 text-green-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                    <p class="text-sm font-semibold text-green-700">Cobro registrado</p>
                  </div>
                  <div class="grid grid-cols-2 gap-x-8 gap-y-4">
                    <div>
                      <p class="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">Monto</p>
                      <p class="text-xl font-bold text-gray-900">$ {{ fmtMonto(atencion()!.cobroServicio!.monto) }}</p>
                    </div>
                    <div>
                      <p class="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">Forma de pago</p>
                      <p class="text-sm text-gray-700">{{ atencion()!.cobroServicio!.formaPagoDescripcion }}</p>
                    </div>
                    <div>
                      <p class="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">Fecha</p>
                      <p class="text-sm text-gray-700">{{ fmtFecha(atencion()!.cobroServicio!.fechaCobro) }}</p>
                    </div>
                  </div>
                  @if (atencion()!.cobroServicio!.observaciones) {
                    <div class="border-t border-gray-100 pt-4">
                      <p class="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">Observaciones</p>
                      <p class="text-sm text-gray-700">{{ atencion()!.cobroServicio!.observaciones }}</p>
                    </div>
                  }
                </div>
              } @else {
                <div class="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-5">
                  <p class="text-sm font-medium text-gray-700">Registrar cobro</p>
                  <div>
                    <label for="cobro-fp" class="block text-sm font-medium text-gray-700 mb-1.5">
                      Forma de pago <span class="text-red-500">*</span>
                    </label>
                    <select id="cobro-fp" [value]="formaPagoId()" (change)="formaPagoId.set($any($event.target).value)"
                      class="w-full px-3.5 py-2.5 text-sm rounded-lg border hover:border-gray-300 bg-white
                             transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      [class.border-red-300]="!!formaPagoError()" [class.border-gray-200]="!formaPagoError()">
                      <option value="">— Seleccionar —</option>
                      @for (fp of formasPago(); track fp.formaPagoId) {
                        <option [value]="fp.formaPagoId">{{ fp.descripcion }}</option>
                      }
                    </select>
                    @if (formaPagoError()) { <p class="mt-1 text-xs text-red-600">{{ formaPagoError() }}</p> }
                  </div>
                  <div>
                    <label for="cobro-monto" class="block text-sm font-medium text-gray-700 mb-1.5">
                      Monto <span class="text-red-500">*</span>
                    </label>
                    <input id="cobro-monto" type="number" min="0.01" step="0.01" placeholder="0.00"
                           [value]="monto()" (input)="monto.set($any($event.target).value)"
                           class="w-full px-3.5 py-2.5 text-sm rounded-lg border hover:border-gray-300 bg-white
                                  transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                           [class.border-red-300]="!!montoError()" [class.border-gray-200]="!montoError()"/>
                    @if (montoError()) { <p class="mt-1 text-xs text-red-600">{{ montoError() }}</p> }
                  </div>
                  <div>
                    <label for="cobro-obs" class="block text-sm font-medium text-gray-700 mb-1.5">
                      Observaciones <span class="text-gray-400 font-normal">(opcional)</span>
                    </label>
                    <textarea id="cobro-obs" rows="3" maxlength="500"
                              [value]="observaciones()" (input)="observaciones.set($any($event.target).value)"
                              class="w-full px-3.5 py-2.5 text-sm rounded-lg border border-gray-200 hover:border-gray-300
                                     bg-white transition-colors resize-none focus:outline-none focus:ring-2
                                     focus:ring-blue-500 focus:border-transparent"></textarea>
                  </div>
                  <div class="flex justify-end">
                    <button type="button" (click)="registrarCobro()" [disabled]="cobroLoading()"
                      class="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white
                             bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed
                             rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                      @if (cobroLoading()) {
                        <svg class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                        </svg>
                      }
                      Registrar cobro
                    </button>
                  </div>
                </div>
              }
            </div>
          }

        </div>
      }

    </div>
  `,
})
export class AtencionDetailComponent implements OnInit {
  private readonly atencionService = inject(AtencionService);
  private readonly anamnesisService = inject(AnamnesisService);
  private readonly recetaService = inject(RecetaCristalesService);
  private readonly formaPagoService = inject(FormaPagoService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);

  readonly atencion = signal<AtencionDto | null>(null);
  readonly formasPago = signal<FormaPagoDto[]>([]);
  readonly loading = signal(false);
  readonly actionLoading = signal(false);
  readonly activeTab = signal<TabType>('informacion');

  // Anamnesis tab
  readonly anamnesisData = signal<AnamnesisDto | null>(null);
  readonly anamnesisLoading = signal(false);
  readonly anamnesisSaving = signal(false);
  readonly anaHipertension = signal(false);
  readonly anaDiabetes = signal(false);
  readonly anaAlergias = signal(false);
  readonly anaUsaLentes = signal(false);
  readonly anaObservacion = signal('');

  // Receta tab
  readonly recetaData = signal<RecetaCristalesDto | null>(null);
  readonly recetaLoading = signal(false);
  readonly recetaSaving = signal(false);
  readonly recetaEdit = signal<RecetaState>({ ...RECETA_EMPTY });

  // Cobro form
  readonly formaPagoId = signal('');
  readonly monto = signal('');
  readonly observaciones = signal('');
  readonly cobroTouched = signal(false);
  readonly cobroLoading = signal(false);

  readonly formaPagoError = computed(() =>
    this.cobroTouched() && !this.formaPagoId() ? 'Seleccione una forma de pago' : ''
  );
  readonly montoError = computed(() => {
    if (!this.cobroTouched()) return '';
    const n = parseFloat(this.monto());
    if (!this.monto() || isNaN(n)) return 'Ingrese un monto válido';
    if (n <= 0) return 'El monto debe ser mayor a 0';
    return '';
  });
  readonly cobroFormValid = computed(() =>
    !!this.formaPagoId() && !!this.monto() && parseFloat(this.monto()) > 0
  );
  readonly esNoEditable = computed(() => this.atencion()?.estado !== 'Abierta');

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.loadAtencion(id);
    this.formaPagoService.getAll()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({ next: fps => this.formasPago.set(fps) });
  }

  private loadAtencion(id: string, onSuccess?: () => void): void {
    this.loading.set(true);
    this.atencionService.getById(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: at => {
          this.atencion.set(at);
          this.loading.set(false);
          onSuccess?.();
        },
        error: () => {
          this.loading.set(false);
          this.router.navigate(['/atenciones']);
        },
      });
  }

  switchTab(tab: TabType): void {
    if (tab === 'cobro' && this.atencion()?.estado !== 'Terminada' && this.atencion()?.estado !== 'Pagada') return;
    this.activeTab.set(tab);
    if (tab === 'anamnesis' && !this.anamnesisData() && this.atencion()?.anamnesisId) {
      this.loadAnamnesis();
    }
    if (tab === 'receta' && !this.recetaData() && this.atencion()?.recetaCristalesId) {
      this.loadReceta();
    }
  }

  private loadAnamnesis(): void {
    this.anamnesisLoading.set(true);
    this.anamnesisService.getById(this.atencion()!.anamnesisId!)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: data => {
          this.anamnesisData.set(data);
          this.anaHipertension.set(data.hipertension);
          this.anaDiabetes.set(data.diabetes);
          this.anaAlergias.set(data.alergias);
          this.anaUsaLentes.set(data.usaLentes);
          this.anaObservacion.set(data.observacion ?? '');
          this.anamnesisLoading.set(false);
        },
        error: () => this.anamnesisLoading.set(false),
      });
  }

  private loadReceta(): void {
    this.recetaLoading.set(true);
    this.recetaService.getById(this.atencion()!.recetaCristalesId!)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: data => {
          this.recetaData.set(data);
          this.recetaEdit.set({
            lejosODEsferico: data.lejosODEsferico ?? '',
            lejosODCilindro: data.lejosODCilindro ?? '',
            lejosODEje: data.lejosODEje ?? '',
            lejosODObservacion: data.lejosODObservacion ?? '',
            lejosOIEsferico: data.lejosOIEsferico ?? '',
            lejosOICilindro: data.lejosOICilindro ?? '',
            lejosOIEje: data.lejosOIEje ?? '',
            lejosOIObservacion: data.lejosOIObservacion ?? '',
            lejosDPEsferico: data.lejosDPEsferico ?? '',
            lejosDPObservacion: data.lejosDPObservacion ?? '',
            cercaODEsferico: data.cercaODEsferico ?? '',
            cercaODCilindro: data.cercaODCilindro ?? '',
            cercaODEje: data.cercaODEje ?? '',
            cercaODObservacion: data.cercaODObservacion ?? '',
            cercaOIEsferico: data.cercaOIEsferico ?? '',
            cercaOICilindro: data.cercaOICilindro ?? '',
            cercaOIEje: data.cercaOIEje ?? '',
            cercaOIObservacion: data.cercaOIObservacion ?? '',
            cercaDPEsferico: data.cercaDPEsferico ?? '',
            cercaDPObservacion: data.cercaDPObservacion ?? '',
            lejosADDEsfera: data.lejosADDEsfera ?? '',
            checkLejos: data.checkLejos,
            checkCerca: data.checkCerca,
            checkCristalesLaboratorio: data.checkCristalesLaboratorio,
            checkUrgente: data.checkUrgente,
          });
          this.recetaLoading.set(false);
        },
        error: () => this.recetaLoading.set(false),
      });
  }

  tabClass(tab: TabType): string {
    const base = 'px-4 py-3 text-sm font-medium border-b-2 transition-colors focus:outline-none -mb-px whitespace-nowrap';
    if (tab === 'cobro' && this.atencion()?.estado !== 'Terminada' && this.atencion()?.estado !== 'Pagada') {
      return `${base} border-transparent text-gray-300 cursor-not-allowed`;
    }
    return this.activeTab() === tab
      ? `${base} border-blue-600 text-blue-700 font-semibold`
      : `${base} border-transparent text-gray-500 hover:text-gray-700`;
  }

  estadoBadge(estado: EstadoAtencion): string { return ESTADO_BADGE[estado]; }
  estadoLabel(estado: EstadoAtencion): string  { return ESTADO_LABEL[estado]; }
  fmtFecha(iso: string): string                { return formatFecha(iso); }

  fmtMonto(n: number): string {
    return n.toLocaleString('es-CL', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
  }

  guardarAnamnesis(): void {
    this.anamnesisSaving.set(true);
    this.anamnesisService.update(this.anamnesisData()!.anamnesisId, {
      hipertension: this.anaHipertension(),
      diabetes: this.anaDiabetes(),
      alergias: this.anaAlergias(),
      usaLentes: this.anaUsaLentes(),
      observacion: this.anaObservacion().trim() || undefined,
    }).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        this.anamnesisSaving.set(false);
        Swal.fire({ icon: 'success', title: 'Guardado', timer: 1500, timerProgressBar: true, showConfirmButton: false });
      },
      error: (err: { error?: { detail?: string } }) => {
        this.anamnesisSaving.set(false);
        Swal.fire({ icon: 'error', title: 'Error',
          text: err.error?.detail ?? 'No se pudo guardar la anamnesis.', confirmButtonColor: '#2563eb' });
      },
    });
  }

  guardarReceta(): void {
    this.recetaSaving.set(true);
    const r = this.recetaEdit();
    const data = this.recetaData()!;
    this.recetaService.update(data.recetaCristalesId, {
      lejosODEsferico: r.lejosODEsferico.trim() || undefined,
      lejosODCilindro: r.lejosODCilindro.trim() || undefined,
      lejosODEje: r.lejosODEje.trim() || undefined,
      lejosODObservacion: r.lejosODObservacion.trim() || undefined,
      lejosOIEsferico: r.lejosOIEsferico.trim() || undefined,
      lejosOICilindro: r.lejosOICilindro.trim() || undefined,
      lejosOIEje: r.lejosOIEje.trim() || undefined,
      lejosOIObservacion: r.lejosOIObservacion.trim() || undefined,
      lejosDPEsferico: r.lejosDPEsferico.trim() || undefined,
      lejosDPObservacion: r.lejosDPObservacion.trim() || undefined,
      cercaODEsferico: r.cercaODEsferico.trim() || undefined,
      cercaODCilindro: r.cercaODCilindro.trim() || undefined,
      cercaODEje: r.cercaODEje.trim() || undefined,
      cercaODObservacion: r.cercaODObservacion.trim() || undefined,
      cercaOIEsferico: r.cercaOIEsferico.trim() || undefined,
      cercaOICilindro: r.cercaOICilindro.trim() || undefined,
      cercaOIEje: r.cercaOIEje.trim() || undefined,
      cercaOIObservacion: r.cercaOIObservacion.trim() || undefined,
      cercaDPEsferico: r.cercaDPEsferico.trim() || undefined,
      cercaDPObservacion: r.cercaDPObservacion.trim() || undefined,
      lejosADDEsfera: r.lejosADDEsfera.trim() || undefined,
      checkLejos: r.checkLejos,
      checkCerca: r.checkCerca,
      checkCristalesLaboratorio: r.checkCristalesLaboratorio,
      checkUrgente: r.checkUrgente,
      fechaIngreso: data.fechaIngreso,
    }).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        this.recetaSaving.set(false);
        Swal.fire({ icon: 'success', title: 'Guardado', timer: 1500, timerProgressBar: true, showConfirmButton: false });
      },
      error: (err: { error?: { detail?: string } }) => {
        this.recetaSaving.set(false);
        Swal.fire({ icon: 'error', title: 'Error',
          text: err.error?.detail ?? 'No se pudo guardar la receta.', confirmButtonColor: '#2563eb' });
      },
    });
  }

  async terminar(): Promise<void> {
    const res = await Swal.fire({
      title: '¿Terminar el servicio?',
      text: 'El estado cambiará a "Terminada". Podrá registrar el cobro a continuación.',
      icon: 'question', showCancelButton: true,
      confirmButtonColor: '#2563eb', cancelButtonText: 'Cancelar', confirmButtonText: 'Sí, terminar',
    });
    if (!res.isConfirmed) return;
    this.actionLoading.set(true);
    const id = this.atencion()!.atencionId;
    this.atencionService.terminar(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.actionLoading.set(false);
          this.loadAtencion(id, () => this.activeTab.set('cobro'));
        },
        error: (err: { error?: { detail?: string } }) => {
          this.actionLoading.set(false);
          Swal.fire({ icon: 'error', title: 'Error',
            text: err.error?.detail ?? 'No se pudo terminar la atención.', confirmButtonColor: '#2563eb' });
        },
      });
  }

  async derivarAOT(): Promise<void> {
    const res = await Swal.fire({
      title: '¿Derivar a Orden de Trabajo?',
      text: 'La atención pasará a "Derivó a OT". Esta acción no se puede revertir.',
      icon: 'warning', showCancelButton: true,
      confirmButtonColor: '#7c3aed', cancelButtonText: 'Cancelar', confirmButtonText: 'Sí, derivar',
    });
    if (!res.isConfirmed) return;
    this.actionLoading.set(true);
    const id = this.atencion()!.atencionId;
    this.atencionService.derivarAOT(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.actionLoading.set(false);
          const at = this.atencion()!;
          this.router.navigate(['/ordenes-trabajo/nueva'], {
            state: {
              clienteId: at.clienteId,
              clienteNombre: at.clienteNombre,
              recetaCristalesId: at.recetaCristalesId,
            },
          });
        },
        error: (err: { error?: { detail?: string } }) => {
          this.actionLoading.set(false);
          Swal.fire({ icon: 'error', title: 'Error',
            text: err.error?.detail ?? 'No se pudo derivar la atención.', confirmButtonColor: '#2563eb' });
        },
      });
  }

  registrarCobro(): void {
    this.cobroTouched.set(true);
    if (!this.cobroFormValid()) return;
    this.cobroLoading.set(true);
    const id = this.atencion()!.atencionId;
    this.atencionService.registrarCobro(id, {
      formaPagoId: parseInt(this.formaPagoId(), 10),
      monto: parseFloat(this.monto()),
      observaciones: this.observaciones().trim() || undefined,
    }).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        this.cobroLoading.set(false);
        this.loadAtencion(id);
        Swal.fire({ icon: 'success', title: 'Cobro registrado',
          timer: 1500, timerProgressBar: true, showConfirmButton: false });
      },
      error: (err: { error?: { detail?: string } }) => {
        this.cobroLoading.set(false);
        Swal.fire({ icon: 'error', title: 'Error',
          text: err.error?.detail ?? 'No se pudo registrar el cobro.', confirmButtonColor: '#2563eb' });
      },
    });
  }

  volver(): void { this.router.navigate(['/atenciones']); }
}
