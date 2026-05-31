import { Component, inject, signal, computed, OnInit, DestroyRef } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { IniciarAtencionRequest } from '../../../core/models/atencion.model';
import { UsuarioDto } from '../../../core/models/usuario.model';
import { AtencionService } from '../../../core/services/atencion.service';
import { AgendaService } from '../../../core/services/agenda.service';
import { UsuarioService } from '../../../core/services/usuario.service';
import Swal from 'sweetalert2';

interface RecetaState {
  lejosODEsferico: string; lejosODCilindro: string; lejosODEje: string; lejosODObservacion: string;
  lejosOIEsferico: string; lejosOICilindro: string; lejosOIEje: string; lejosOIObservacion: string;
  lejosDPEsferico: string; lejosDPObservacion: string;
  cercaODEsferico: string; cercaODCilindro: string; cercaODEje: string; cercaODObservacion: string;
  cercaOIEsferico: string; cercaOICilindro: string; cercaOIEje: string; cercaOIObservacion: string;
  cercaDPEsferico: string; cercaDPObservacion: string;
  lejosADDEsfera: string;
  checkLejos: boolean; checkCerca: boolean; checkCristalesLaboratorio: boolean; checkUrgente: boolean;
}

const RECETA_EMPTY: RecetaState = {
  lejosODEsferico: '', lejosODCilindro: '', lejosODEje: '', lejosODObservacion: '',
  lejosOIEsferico: '', lejosOICilindro: '', lejosOIEje: '', lejosOIObservacion: '',
  lejosDPEsferico: '', lejosDPObservacion: '',
  cercaODEsferico: '', cercaODCilindro: '', cercaODEje: '', cercaODObservacion: '',
  cercaOIEsferico: '', cercaOICilindro: '', cercaOIEje: '', cercaOIObservacion: '',
  cercaDPEsferico: '', cercaDPObservacion: '',
  lejosADDEsfera: '',
  checkLejos: false, checkCerca: false, checkCristalesLaboratorio: false, checkUrgente: false,
};

const INP = 'w-full px-2 py-1.5 text-xs rounded border border-gray-200 hover:border-gray-300 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent';

@Component({
  selector: 'app-atencion-iniciar',
  standalone: true,
  imports: [],
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
          <h1 class="text-lg font-semibold text-gray-900">Iniciar atención</h1>
          @if (clienteNombre()) {
            <p class="text-xs text-gray-400 mt-0.5">{{ clienteNombre() }}</p>
          }
        </div>
        @if (pageLoading() || loading()) {
          <svg class="w-4 h-4 animate-spin text-blue-500" fill="none" viewBox="0 0 24 24" aria-hidden="true">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
          </svg>
        }
      </div>

      <!-- Step indicator -->
      <div class="bg-white border-b border-gray-100 px-6 py-3 shrink-0">
        <div class="flex items-center max-w-xl mx-auto">
          <div class="flex items-center gap-1.5 shrink-0">
            <div class="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors"
                 [class.bg-blue-600]="step() >= 1" [class.text-white]="step() >= 1"
                 [class.bg-gray-100]="step() < 1"  [class.text-gray-400]="step() < 1">1</div>
            <span class="text-xs font-medium hidden sm:block transition-colors"
                  [class.text-blue-700]="step() >= 1" [class.text-gray-400]="step() < 1">Atención</span>
          </div>
          <div class="flex-1 h-px mx-3 transition-colors"
               [class.bg-blue-300]="step() > 1" [class.bg-gray-200]="step() <= 1"></div>
          <div class="flex items-center gap-1.5 shrink-0">
            <div class="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors"
                 [class.bg-blue-600]="step() >= 2" [class.text-white]="step() >= 2"
                 [class.bg-gray-100]="step() < 2"  [class.text-gray-400]="step() < 2">2</div>
            <span class="text-xs font-medium hidden sm:block transition-colors"
                  [class.text-blue-700]="step() >= 2" [class.text-gray-400]="step() < 2">Anamnesis</span>
          </div>
          <div class="flex-1 h-px mx-3 transition-colors"
               [class.bg-blue-300]="step() > 2" [class.bg-gray-200]="step() <= 2"></div>
          <div class="flex items-center gap-1.5 shrink-0">
            <div class="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors"
                 [class.bg-blue-600]="step() >= 3" [class.text-white]="step() >= 3"
                 [class.bg-gray-100]="step() < 3"  [class.text-gray-400]="step() < 3">3</div>
            <span class="text-xs font-medium hidden sm:block transition-colors"
                  [class.text-blue-700]="step() >= 3" [class.text-gray-400]="step() < 3">Receta Cristales</span>
          </div>
        </div>
      </div>

      <!-- Loading page -->
      @if (pageLoading()) {
        <div class="flex items-center justify-center flex-1">
          <svg class="w-8 h-8 animate-spin text-blue-500" fill="none" viewBox="0 0 24 24" aria-hidden="true">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
          </svg>
        </div>
      }

      <!-- Step 1: Atención -->
      @if (!pageLoading() && step() === 1) {
        <div class="flex-1 overflow-auto p-6">
          <div class="max-w-xl mx-auto bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-5">

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1.5">Cliente</label>
              <div class="flex items-center gap-2 px-3.5 py-2.5 rounded-lg border border-gray-200 bg-gray-50 text-sm text-gray-700">
                <svg class="w-4 h-4 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                </svg>
                {{ clienteNombre() }}
              </div>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label for="ini-fecha" class="block text-sm font-medium text-gray-700 mb-1.5">
                  Fecha <span class="text-red-500">*</span>
                </label>
                <input id="ini-fecha" type="date"
                       [value]="fecha()" (input)="fecha.set($any($event.target).value)"
                       class="w-full px-3.5 py-2.5 text-sm rounded-lg border hover:border-gray-300 bg-white
                              transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                       [class.border-red-300]="!!fechaError()" [class.border-gray-200]="!fechaError()"/>
                @if (fechaError()) { <p class="mt-1 text-xs text-red-600">{{ fechaError() }}</p> }
              </div>
              <div>
                <label for="ini-hora" class="block text-sm font-medium text-gray-700 mb-1.5">
                  Hora <span class="text-red-500">*</span>
                </label>
                <input id="ini-hora" type="time"
                       [value]="hora()" (input)="hora.set($any($event.target).value)"
                       class="w-full px-3.5 py-2.5 text-sm rounded-lg border border-gray-200 hover:border-gray-300 bg-white
                              transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"/>
              </div>
            </div>

            <div>
              <label for="ini-prof" class="block text-sm font-medium text-gray-700 mb-1.5">
                Profesional <span class="text-red-500">*</span>
              </label>
              <select id="ini-prof"
                      [value]="selectedUsuarioId()" (change)="selectedUsuarioId.set($any($event.target).value)"
                      class="w-full px-3.5 py-2.5 text-sm rounded-lg border hover:border-gray-300 bg-white
                             transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      [class.border-red-300]="!!usuarioError()" [class.border-gray-200]="!usuarioError()">
                <option value="">— Seleccionar profesional —</option>
                @for (u of usuarios(); track u.usuarioId) {
                  <option [value]="u.usuarioId">{{ u.nombre }}</option>
                }
              </select>
              @if (usuarioError()) { <p class="mt-1 text-xs text-red-600">{{ usuarioError() }}</p> }
            </div>

            <div>
              <label for="ini-motivo" class="block text-sm font-medium text-gray-700 mb-1.5">
                Motivo <span class="text-red-500">*</span>
              </label>
              <input id="ini-motivo" type="text" maxlength="300"
                     placeholder="Ej: Control visual, Entrega de lentes..."
                     [value]="motivo()" (input)="motivo.set($any($event.target).value)"
                     class="w-full px-3.5 py-2.5 text-sm rounded-lg border hover:border-gray-300 bg-white
                            transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                     [class.border-red-300]="!!motivoError()" [class.border-gray-200]="!motivoError()"/>
              @if (motivoError()) { <p class="mt-1 text-xs text-red-600">{{ motivoError() }}</p> }
            </div>

            <div>
              <label for="ini-obs" class="block text-sm font-medium text-gray-700 mb-1.5">
                Observaciones <span class="text-gray-400 font-normal">(opcional)</span>
              </label>
              <textarea id="ini-obs" rows="3" maxlength="2000"
                        [value]="observaciones()" (input)="observaciones.set($any($event.target).value)"
                        class="w-full px-3.5 py-2.5 text-sm rounded-lg border border-gray-200 hover:border-gray-300
                               bg-white transition-colors resize-none focus:outline-none focus:ring-2
                               focus:ring-blue-500 focus:border-transparent"></textarea>
            </div>

          </div>
        </div>
      }

      <!-- Step 2: Anamnesis -->
      @if (!pageLoading() && step() === 2) {
        <div class="flex-1 overflow-auto p-6">
          <div class="max-w-xl mx-auto bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-5">
            <p class="text-sm font-medium text-gray-700">Antecedentes del paciente</p>

            <div class="grid grid-cols-2 gap-3">
              <label class="flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors"
                     [class.border-blue-300]="hipertension()" [class.bg-blue-50]="hipertension()"
                     [class.border-gray-200]="!hipertension()" [class.hover:bg-gray-50]="!hipertension()">
                <input type="checkbox" [checked]="hipertension()" (change)="hipertension.set($any($event.target).checked)"
                       class="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"/>
                <span class="text-sm text-gray-700">Hipertensión</span>
              </label>
              <label class="flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors"
                     [class.border-blue-300]="diabetes()" [class.bg-blue-50]="diabetes()"
                     [class.border-gray-200]="!diabetes()" [class.hover:bg-gray-50]="!diabetes()">
                <input type="checkbox" [checked]="diabetes()" (change)="diabetes.set($any($event.target).checked)"
                       class="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"/>
                <span class="text-sm text-gray-700">Diabetes</span>
              </label>
              <label class="flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors"
                     [class.border-blue-300]="alergias()" [class.bg-blue-50]="alergias()"
                     [class.border-gray-200]="!alergias()" [class.hover:bg-gray-50]="!alergias()">
                <input type="checkbox" [checked]="alergias()" (change)="alergias.set($any($event.target).checked)"
                       class="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"/>
                <span class="text-sm text-gray-700">Alergias</span>
              </label>
              <label class="flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors"
                     [class.border-blue-300]="usaLentes()" [class.bg-blue-50]="usaLentes()"
                     [class.border-gray-200]="!usaLentes()" [class.hover:bg-gray-50]="!usaLentes()">
                <input type="checkbox" [checked]="usaLentes()" (change)="usaLentes.set($any($event.target).checked)"
                       class="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"/>
                <span class="text-sm text-gray-700">Usa lentes</span>
              </label>
            </div>

            <div>
              <label for="ana-obs" class="block text-sm font-medium text-gray-700 mb-1.5">
                Observaciones <span class="text-gray-400 font-normal">(opcional)</span>
              </label>
              <textarea id="ana-obs" rows="3" maxlength="2000"
                        placeholder="Antecedentes adicionales..."
                        [value]="anamnesisObs()" (input)="anamnesisObs.set($any($event.target).value)"
                        class="w-full px-3.5 py-2.5 text-sm rounded-lg border border-gray-200 hover:border-gray-300
                               bg-white transition-colors resize-none focus:outline-none focus:ring-2
                               focus:ring-blue-500 focus:border-transparent"></textarea>
            </div>
          </div>
        </div>
      }

      <!-- Step 3: Receta Cristales -->
      @if (!pageLoading() && step() === 3) {
        <div class="flex-1 overflow-auto p-6">
          <div class="max-w-4xl mx-auto space-y-4">

            <!-- Indicaciones -->
            <div class="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
              <p class="text-sm font-medium text-gray-700 mb-3">Indicaciones</p>
              <div class="grid grid-cols-2 gap-3">
                <label class="flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all"
                       [class.border-blue-400]="receta().checkLejos"
                       [class.bg-blue-50]="receta().checkLejos"
                       [class.border-gray-200]="!receta().checkLejos">
                  <input type="checkbox" [checked]="receta().checkLejos"
                         (change)="onCheckLejos($any($event.target).checked)"
                         class="w-4 h-4 shrink-0 rounded border-gray-300 text-blue-600 focus:ring-blue-500"/>
                  <div>
                    <p class="text-sm font-medium text-gray-800">Lejos</p>
                    <p class="text-xs text-gray-400">Activa la sección de lejos</p>
                  </div>
                </label>
                <label class="flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all"
                       [class.border-blue-400]="receta().checkCerca"
                       [class.bg-blue-50]="receta().checkCerca"
                       [class.border-gray-200]="!receta().checkCerca">
                  <input type="checkbox" [checked]="receta().checkCerca"
                         (change)="onCheckCerca($any($event.target).checked)"
                         class="w-4 h-4 shrink-0 rounded border-gray-300 text-blue-600 focus:ring-blue-500"/>
                  <div>
                    <p class="text-sm font-medium text-gray-800">Cerca</p>
                    <p class="text-xs text-gray-400">Activa la sección de cerca</p>
                  </div>
                </label>
              </div>
            </div>

            <!-- Lejos + Cerca: side by side cuando ambos activos -->
            @if (receta().checkLejos || receta().checkCerca) {
              <div class="grid gap-4"
                   [class.grid-cols-2]="receta().checkLejos && receta().checkCerca">

                <!-- Lejos -->
                @if (receta().checkLejos) {
                  <div class="bg-white rounded-2xl border border-blue-100 shadow-sm p-4">
                    <p class="text-sm font-semibold text-blue-700 mb-3">Lejos</p>
                    <table class="w-full">
                      <thead><tr>
                        <th class="w-10 pb-2 pr-2 text-left"></th>
                        <th class="pb-2 text-center text-xs font-semibold text-gray-500 px-1">OD</th>
                        <th class="pb-2 text-center text-xs font-semibold text-gray-500 px-1">OI</th>
                        <th class="pb-2 text-center text-xs font-semibold text-gray-500 px-1">DP</th>
                      </tr></thead>
                      <tbody class="divide-y divide-gray-50">
                        <tr>
                          <td class="py-1.5 pr-2 text-xs font-medium text-gray-500">Esf.</td>
                          <td class="py-1.5 px-1"><input type="text" placeholder="+/-0.00" [class]="inputCls" [value]="receta().lejosODEsferico" (input)="onLejosChange('lejosODEsferico', $any($event.target).value)"/></td>
                          <td class="py-1.5 px-1"><input type="text" placeholder="+/-0.00" [class]="inputCls" [value]="receta().lejosOIEsferico" (input)="onLejosChange('lejosOIEsferico', $any($event.target).value)"/></td>
                          <td class="py-1.5 px-1"><input type="text" placeholder="+/-0.00" [class]="inputCls" [value]="receta().lejosDPEsferico" (input)="setReceta('lejosDPEsferico', $any($event.target).value)"/></td>
                        </tr>
                        <tr>
                          <td class="py-1.5 pr-2 text-xs font-medium text-gray-500">Cil.</td>
                          <td class="py-1.5 px-1"><input type="text" placeholder="+/-0.00" [class]="inputCls" [value]="receta().lejosODCilindro" (input)="onLejosChange('lejosODCilindro', $any($event.target).value)"/></td>
                          <td class="py-1.5 px-1"><input type="text" placeholder="+/-0.00" [class]="inputCls" [value]="receta().lejosOICilindro" (input)="onLejosChange('lejosOICilindro', $any($event.target).value)"/></td>
                          <td class="py-1.5 px-1 text-center text-gray-300 text-xs">—</td>
                        </tr>
                        <tr>
                          <td class="py-1.5 pr-2 text-xs font-medium text-gray-500">Eje</td>
                          <td class="py-1.5 px-1"><input type="text" placeholder="0°" [class]="inputCls" [value]="receta().lejosODEje" (input)="onLejosChange('lejosODEje', $any($event.target).value)"/></td>
                          <td class="py-1.5 px-1"><input type="text" placeholder="0°" [class]="inputCls" [value]="receta().lejosOIEje" (input)="onLejosChange('lejosOIEje', $any($event.target).value)"/></td>
                          <td class="py-1.5 px-1 text-center text-gray-300 text-xs">—</td>
                        </tr>
                      </tbody>
                    </table>
                    <div class="mt-3 pt-3 border-t border-gray-100 space-y-2">
                      <div>
                        <label class="block text-xs font-medium text-gray-500 mb-1">ADD <span class="font-normal text-gray-400">(adición)</span></label>
                        <input type="text" placeholder="+0.00" [class]="inputCls"
                               [value]="receta().lejosADDEsfera" (input)="onADDChange($any($event.target).value)"/>
                        <p class="text-[10px] text-gray-400 mt-0.5">Auto-rellena la sección Cerca</p>
                      </div>
                      <div>
                        <label class="block text-xs font-medium text-gray-500 mb-1">Observación</label>
                        <input type="text" maxlength="500" placeholder="Observaciones de lejos..." [class]="inputCls"
                               [value]="receta().lejosODObservacion" (input)="setReceta('lejosODObservacion', $any($event.target).value)"/>
                      </div>
                    </div>
                  </div>
                }

                <!-- Cerca -->
                @if (receta().checkCerca) {
                  <div class="bg-white rounded-2xl border border-blue-100 shadow-sm p-4">
                    <div class="flex items-center justify-between mb-3">
                      <p class="text-sm font-semibold text-blue-700">Cerca</p>
                      @if (receta().lejosADDEsfera) {
                        <span class="text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
                          Auto-calculada ADD
                        </span>
                      }
                    </div>
                    <table class="w-full">
                      <thead><tr>
                        <th class="w-10 pb-2 pr-2 text-left"></th>
                        <th class="pb-2 text-center text-xs font-semibold text-gray-500 px-1">OD</th>
                        <th class="pb-2 text-center text-xs font-semibold text-gray-500 px-1">OI</th>
                        <th class="pb-2 text-center text-xs font-semibold text-gray-500 px-1">DP</th>
                      </tr></thead>
                      <tbody class="divide-y divide-gray-50">
                        <tr>
                          <td class="py-1.5 pr-2 text-xs font-medium text-gray-500">Esf.</td>
                          <td class="py-1.5 px-1"><input type="text" placeholder="+/-0.00" [class]="inputCls" [value]="receta().cercaODEsferico" (input)="setReceta('cercaODEsferico', $any($event.target).value)"/></td>
                          <td class="py-1.5 px-1"><input type="text" placeholder="+/-0.00" [class]="inputCls" [value]="receta().cercaOIEsferico" (input)="setReceta('cercaOIEsferico', $any($event.target).value)"/></td>
                          <td class="py-1.5 px-1"><input type="text" placeholder="+/-0.00" [class]="inputCls" [value]="receta().cercaDPEsferico" (input)="setReceta('cercaDPEsferico', $any($event.target).value)"/></td>
                        </tr>
                        <tr>
                          <td class="py-1.5 pr-2 text-xs font-medium text-gray-500">Cil.</td>
                          <td class="py-1.5 px-1"><input type="text" placeholder="+/-0.00" [class]="inputCls" [value]="receta().cercaODCilindro" (input)="setReceta('cercaODCilindro', $any($event.target).value)"/></td>
                          <td class="py-1.5 px-1"><input type="text" placeholder="+/-0.00" [class]="inputCls" [value]="receta().cercaOICilindro" (input)="setReceta('cercaOICilindro', $any($event.target).value)"/></td>
                          <td class="py-1.5 px-1 text-center text-gray-300 text-xs">—</td>
                        </tr>
                        <tr>
                          <td class="py-1.5 pr-2 text-xs font-medium text-gray-500">Eje</td>
                          <td class="py-1.5 px-1"><input type="text" placeholder="0°" [class]="inputCls" [value]="receta().cercaODEje" (input)="setReceta('cercaODEje', $any($event.target).value)"/></td>
                          <td class="py-1.5 px-1"><input type="text" placeholder="0°" [class]="inputCls" [value]="receta().cercaOIEje" (input)="setReceta('cercaOIEje', $any($event.target).value)"/></td>
                          <td class="py-1.5 px-1 text-center text-gray-300 text-xs">—</td>
                        </tr>
                      </tbody>
                    </table>
                    <div class="mt-3 pt-3 border-t border-gray-100">
                      <label class="block text-xs font-medium text-gray-500 mb-1">Observación</label>
                      <input type="text" maxlength="500" placeholder="Observaciones de cerca..." [class]="inputCls"
                             [value]="receta().cercaODObservacion" (input)="setReceta('cercaODObservacion', $any($event.target).value)"/>
                    </div>
                  </div>
                }

              </div>
            }

          </div>
        </div>
      }

      <!-- Footer: nav buttons -->
      @if (!pageLoading()) {
        <div class="flex items-center justify-between px-6 py-4 bg-white border-t border-gray-100 shrink-0">
          <button type="button" (click)="step() > 1 ? anterior() : volver()"
            class="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white
                   border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors
                   focus:outline-none focus:ring-2 focus:ring-gray-300">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
            </svg>
            {{ step() > 1 ? 'Anterior' : 'Cancelar' }}
          </button>

          @if (step() < 3) {
            <button type="button" (click)="siguiente()"
              class="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white
                     bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-lg transition-colors
                     focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
              Siguiente
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
              </svg>
            </button>
          } @else {
            <button type="button" (click)="submit()" [disabled]="loading()"
              class="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white
                     bg-blue-600 hover:bg-blue-700 active:bg-blue-800
                     disabled:bg-blue-400 disabled:cursor-not-allowed
                     rounded-lg transition-colors focus:outline-none focus:ring-2
                     focus:ring-blue-500 focus:ring-offset-2">
              @if (loading()) {
                <svg class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
              }
              Iniciar atención
            </button>
          }
        </div>
      }

    </div>
  `,
})
export class AtencionIniciarComponent implements OnInit {
  private readonly atencionService = inject(AtencionService);
  private readonly agendaService = inject(AgendaService);
  private readonly usuarioService = inject(UsuarioService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);

  readonly step = signal<1 | 2 | 3>(1);
  readonly pageLoading = signal(false);
  readonly loading = signal(false);
  readonly step1Touched = signal(false);

  readonly agendaId = signal<string | null>(null);
  readonly clienteId = signal('');
  readonly clienteNombre = signal('');
  readonly usuarios = signal<UsuarioDto[]>([]);
  readonly fecha = signal('');
  readonly hora = signal('');
  readonly motivo = signal('');
  readonly selectedUsuarioId = signal('');
  readonly observaciones = signal('');

  readonly hipertension = signal(false);
  readonly diabetes = signal(false);
  readonly alergias = signal(false);
  readonly usaLentes = signal(false);
  readonly anamnesisObs = signal('');

  readonly receta = signal<RecetaState>({ ...RECETA_EMPTY });

  readonly inputCls = INP;

  readonly fechaError = computed(() =>
    this.step1Touched() && !this.fecha() ? 'Seleccione una fecha' : ''
  );
  readonly motivoError = computed(() =>
    this.step1Touched() && !this.motivo().trim() ? 'El motivo es obligatorio' : ''
  );
  readonly usuarioError = computed(() =>
    this.step1Touched() && !this.selectedUsuarioId() ? 'Seleccione un profesional' : ''
  );
  readonly step1Valid = computed(() =>
    !!this.fecha() && !!this.hora() && !!this.motivo().trim() && !!this.selectedUsuarioId()
  );

  ngOnInit(): void {
    const agendaId = this.route.snapshot.queryParamMap.get('agendaId');
    if (!agendaId) {
      this.router.navigate(['/atenciones']);
      return;
    }
    this.agendaId.set(agendaId);
    this.pageLoading.set(true);

    this.usuarioService.getAll()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({ next: us => this.usuarios.set(us) });

    this.agendaService.getById(agendaId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: agenda => {
          this.clienteId.set(agenda.clienteId);
          this.clienteNombre.set(agenda.clienteNombre);
          const [datePart, timePart] = agenda.fechaHora.split('T');
          this.fecha.set(datePart);
          this.hora.set(timePart.substring(0, 5));
          this.motivo.set(agenda.motivo);
          if (agenda.usuarioId) this.selectedUsuarioId.set(agenda.usuarioId);
          this.pageLoading.set(false);
        },
        error: () => {
          this.pageLoading.set(false);
          Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo cargar la cita.', confirmButtonColor: '#2563eb' });
          this.router.navigate(['/atenciones']);
        },
      });
  }

  siguiente(): void {
    if (this.step() === 1) {
      this.step1Touched.set(true);
      if (!this.step1Valid()) return;
    }
    if (this.step() < 3) this.step.update(s => (s + 1) as 1 | 2 | 3);
  }

  anterior(): void {
    if (this.step() > 1) this.step.update(s => (s - 1) as 1 | 2 | 3);
  }

  setReceta<K extends keyof RecetaState>(key: K, value: RecetaState[K]): void {
    this.receta.update(r => ({ ...r, [key]: value }));
  }

  private applyADD(r: RecetaState): RecetaState {
    const add = parseFloat(r.lejosADDEsfera.replace(',', '.'));
    if (!r.lejosADDEsfera.trim() || isNaN(add) || add <= 0) return r;
    const sum = (s: string) => String(parseFloat(((parseFloat(s.replace(',', '.')) || 0) + add).toFixed(2)));
    return {
      ...r,
      checkCerca: true,
      cercaODEsferico: sum(r.lejosODEsferico),
      cercaODCilindro: r.lejosODCilindro,
      cercaODEje: r.lejosODEje,
      cercaOIEsferico: sum(r.lejosOIEsferico),
      cercaOICilindro: r.lejosOICilindro,
      cercaOIEje: r.lejosOIEje,
    };
  }

  onCheckLejos(checked: boolean): void {
    if (checked) { this.receta.update(r => ({ ...r, checkLejos: true })); return; }
    this.receta.update(r => ({
      ...r,
      checkLejos: false,
      lejosODEsferico: '', lejosODCilindro: '', lejosODEje: '', lejosODObservacion: '',
      lejosOIEsferico: '', lejosOICilindro: '', lejosOIEje: '', lejosOIObservacion: '',
      lejosDPEsferico: '', lejosDPObservacion: '', lejosADDEsfera: '',
      checkCerca: false,
      cercaODEsferico: '', cercaODCilindro: '', cercaODEje: '', cercaODObservacion: '',
      cercaOIEsferico: '', cercaOICilindro: '', cercaOIEje: '', cercaOIObservacion: '',
      cercaDPEsferico: '', cercaDPObservacion: '',
    }));
  }

  onCheckCerca(checked: boolean): void {
    if (checked) { this.receta.update(r => ({ ...r, checkCerca: true })); return; }
    this.receta.update(r => ({
      ...r,
      checkCerca: false,
      cercaODEsferico: '', cercaODCilindro: '', cercaODEje: '', cercaODObservacion: '',
      cercaOIEsferico: '', cercaOICilindro: '', cercaOIEje: '', cercaOIObservacion: '',
      cercaDPEsferico: '', cercaDPObservacion: '',
    }));
  }

  onADDChange(value: string): void {
    this.receta.update(r => {
      const withAdd = { ...r, lejosADDEsfera: value };
      const add = parseFloat(value.replace(',', '.'));
      if (!value.trim() || isNaN(add) || add <= 0) {
        return {
          ...withAdd,
          checkCerca: false,
          cercaODEsferico: '', cercaODCilindro: '', cercaODEje: '',
          cercaOIEsferico: '', cercaOICilindro: '', cercaOIEje: '', cercaDPEsferico: '',
        };
      }
      return this.applyADD(withAdd);
    });
  }

  onLejosChange(key: 'lejosODEsferico' | 'lejosOIEsferico' | 'lejosODCilindro' | 'lejosOICilindro' | 'lejosODEje' | 'lejosOIEje', value: string): void {
    this.receta.update(r => this.applyADD({ ...r, [key]: value }));
  }

  submit(): void {
    this.loading.set(true);
    const r = this.receta();
    const request: IniciarAtencionRequest = {
      agendaId: this.agendaId() ?? undefined,
      clienteId: this.clienteId(),
      usuarioAtencionId: this.selectedUsuarioId(),
      fechaHoraAtencion: `${this.fecha()}T${this.hora()}:00`,
      motivo: this.motivo().trim(),
      observaciones: this.observaciones().trim() || undefined,
      hipertension: this.hipertension(),
      diabetes: this.diabetes(),
      alergias: this.alergias(),
      usaLentes: this.usaLentes(),
      anamnesisObservacion: this.anamnesisObs().trim() || undefined,
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
    };

    this.atencionService.iniciar(request)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: result => {
          this.loading.set(false);
          this.router.navigate(['/atenciones', result.atencionId]);
        },
        error: (err: { error?: { detail?: string } }) => {
          this.loading.set(false);
          Swal.fire({
            icon: 'error', title: 'Error',
            text: err.error?.detail ?? 'No se pudo iniciar la atención.',
            confirmButtonColor: '#2563eb',
          });
        },
      });
  }

  volver(): void {
    this.router.navigate(['/atenciones']);
  }
}
