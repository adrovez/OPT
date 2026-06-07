import { Component, input, model } from '@angular/core';

export interface RecetaState {
  lejosODEsferico: string; lejosODCilindro: string; lejosODEje: string; lejosODObservacion: string;
  lejosOIEsferico: string; lejosOICilindro: string; lejosOIEje: string; lejosOIObservacion: string;
  lejosDPEsferico: string; lejosDPObservacion: string;
  cercaODEsferico: string; cercaODCilindro: string; cercaODEje: string; cercaODObservacion: string;
  cercaOIEsferico: string; cercaOICilindro: string; cercaOIEje: string; cercaOIObservacion: string;
  cercaDPEsferico: string; cercaDPObservacion: string;
  lejosADDEsfera: string;
  checkLejos: boolean; checkCerca: boolean; checkCristalesLaboratorio: boolean; checkUrgente: boolean;
}

export const RECETA_EMPTY: RecetaState = {
  lejosODEsferico: '', lejosODCilindro: '', lejosODEje: '', lejosODObservacion: '',
  lejosOIEsferico: '', lejosOICilindro: '', lejosOIEje: '', lejosOIObservacion: '',
  lejosDPEsferico: '', lejosDPObservacion: '',
  cercaODEsferico: '', cercaODCilindro: '', cercaODEje: '', cercaODObservacion: '',
  cercaOIEsferico: '', cercaOICilindro: '', cercaOIEje: '', cercaOIObservacion: '',
  cercaDPEsferico: '', cercaDPObservacion: '',
  lejosADDEsfera: '',
  checkLejos: false, checkCerca: false, checkCristalesLaboratorio: false, checkUrgente: false,
};

const INP = 'w-full px-2 py-1.5 text-xs rounded border border-gray-200 hover:border-gray-300 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-default';

type LejosKey = 'lejosODEsferico' | 'lejosOIEsferico' | 'lejosODCilindro' | 'lejosOICilindro' | 'lejosODEje' | 'lejosOIEje';

@Component({
  selector: 'app-receta-cristales-form',
  standalone: true,
  imports: [],
  template: `
    <!-- Indicaciones -->
    <div class="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
      <div class="flex items-center justify-between mb-3">
        <p class="text-sm font-medium text-gray-700">Indicaciones</p>
        @if (disabled()) {
          <span class="inline-flex items-center gap-1.5 text-xs text-amber-600 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full">
            <svg class="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m0-6v2m-6 4h12a2 2 0 002-2V7a2 2 0 00-2-2H6a2 2 0 00-2 2v8a2 2 0 002 2z"/>
            </svg>
            Solo lectura
          </span>
        }
      </div>
      <div class="grid grid-cols-2 gap-3">
        <label class="flex items-center gap-3 p-3 rounded-lg border transition-all"
               [class.cursor-pointer]="!disabled()" [class.cursor-default]="disabled()"
               [class.border-blue-400]="value().checkLejos"
               [class.bg-blue-50]="value().checkLejos"
               [class.border-gray-200]="!value().checkLejos">
          <input type="checkbox" [checked]="value().checkLejos"
                 (change)="onCheckLejos($any($event.target).checked)"
                 [disabled]="disabled()"
                 class="w-4 h-4 shrink-0 rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-default"/>
          <div>
            <p class="text-sm font-medium text-gray-800">Lejos</p>
            <p class="text-xs text-gray-400">Activa la sección de lejos</p>
          </div>
        </label>
        <label class="flex items-center gap-3 p-3 rounded-lg border transition-all"
               [class.cursor-pointer]="!disabled()" [class.cursor-default]="disabled()"
               [class.border-blue-400]="value().checkCerca"
               [class.bg-blue-50]="value().checkCerca"
               [class.border-gray-200]="!value().checkCerca">
          <input type="checkbox" [checked]="value().checkCerca"
                 (change)="onCheckCerca($any($event.target).checked)"
                 [disabled]="disabled()"
                 class="w-4 h-4 shrink-0 rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-default"/>
          <div>
            <p class="text-sm font-medium text-gray-800">Cerca</p>
            <p class="text-xs text-gray-400">Activa la sección de cerca</p>
          </div>
        </label>
      </div>
    </div>

    <!-- Lejos + Cerca: side by side cuando ambos activos -->
    @if (value().checkLejos || value().checkCerca) {
      <div class="grid gap-4"
           [class.grid-cols-2]="value().checkLejos && value().checkCerca">

        <!-- Lejos -->
        @if (value().checkLejos) {
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
                  <td class="py-1.5 px-1"><input type="text" placeholder="+/-0.00" [class]="inputCls" [disabled]="disabled()" [value]="value().lejosODEsferico" (input)="onLejosChange('lejosODEsferico', $any($event.target).value)"/></td>
                  <td class="py-1.5 px-1"><input type="text" placeholder="+/-0.00" [class]="inputCls" [disabled]="disabled()" [value]="value().lejosOIEsferico" (input)="onLejosChange('lejosOIEsferico', $any($event.target).value)"/></td>
                  <td class="py-1.5 px-1"><input type="text" placeholder="+/-0.00" [class]="inputCls" [disabled]="disabled()" [value]="value().lejosDPEsferico" (input)="set('lejosDPEsferico', $any($event.target).value)"/></td>
                </tr>
                <tr>
                  <td class="py-1.5 pr-2 text-xs font-medium text-gray-500">Cil.</td>
                  <td class="py-1.5 px-1"><input type="text" placeholder="+/-0.00" [class]="inputCls" [disabled]="disabled()" [value]="value().lejosODCilindro" (input)="onLejosChange('lejosODCilindro', $any($event.target).value)"/></td>
                  <td class="py-1.5 px-1"><input type="text" placeholder="+/-0.00" [class]="inputCls" [disabled]="disabled()" [value]="value().lejosOICilindro" (input)="onLejosChange('lejosOICilindro', $any($event.target).value)"/></td>
                  <td class="py-1.5 px-1 text-center text-gray-300 text-xs">—</td>
                </tr>
                <tr>
                  <td class="py-1.5 pr-2 text-xs font-medium text-gray-500">Eje</td>
                  <td class="py-1.5 px-1"><input type="text" placeholder="0°" [class]="inputCls" [disabled]="disabled()" [value]="value().lejosODEje" (input)="onLejosChange('lejosODEje', $any($event.target).value)"/></td>
                  <td class="py-1.5 px-1"><input type="text" placeholder="0°" [class]="inputCls" [disabled]="disabled()" [value]="value().lejosOIEje" (input)="onLejosChange('lejosOIEje', $any($event.target).value)"/></td>
                  <td class="py-1.5 px-1 text-center text-gray-300 text-xs">—</td>
                </tr>
              </tbody>
            </table>
            <div class="mt-3 pt-3 border-t border-gray-100 space-y-2">
              <div>
                <label class="block text-xs font-medium text-gray-500 mb-1">ADD <span class="font-normal text-gray-400">(adición)</span></label>
                <input type="text" placeholder="+0.00" [class]="inputCls" [disabled]="disabled()"
                       [value]="value().lejosADDEsfera" (input)="onADDChange($any($event.target).value)"/>
                <p class="text-[10px] text-gray-400 mt-0.5">Auto-rellena la sección Cerca</p>
              </div>
              <div>
                <label class="block text-xs font-medium text-gray-500 mb-1">Observación</label>
                <input type="text" maxlength="500" placeholder="Observaciones de lejos..." [class]="inputCls" [disabled]="disabled()"
                       [value]="value().lejosODObservacion" (input)="set('lejosODObservacion', $any($event.target).value)"/>
              </div>
            </div>
          </div>
        }

        <!-- Cerca -->
        @if (value().checkCerca) {
          <div class="bg-white rounded-2xl border border-blue-100 shadow-sm p-4">
            <div class="flex items-center justify-between mb-3">
              <p class="text-sm font-semibold text-blue-700">Cerca</p>
              @if (value().lejosADDEsfera) {
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
                  <td class="py-1.5 px-1"><input type="text" placeholder="+/-0.00" [class]="inputCls" [disabled]="disabled()" [value]="value().cercaODEsferico" (input)="set('cercaODEsferico', $any($event.target).value)"/></td>
                  <td class="py-1.5 px-1"><input type="text" placeholder="+/-0.00" [class]="inputCls" [disabled]="disabled()" [value]="value().cercaOIEsferico" (input)="set('cercaOIEsferico', $any($event.target).value)"/></td>
                  <td class="py-1.5 px-1"><input type="text" placeholder="+/-0.00" [class]="inputCls" [disabled]="disabled()" [value]="value().cercaDPEsferico" (input)="set('cercaDPEsferico', $any($event.target).value)"/></td>
                </tr>
                <tr>
                  <td class="py-1.5 pr-2 text-xs font-medium text-gray-500">Cil.</td>
                  <td class="py-1.5 px-1"><input type="text" placeholder="+/-0.00" [class]="inputCls" [disabled]="disabled()" [value]="value().cercaODCilindro" (input)="set('cercaODCilindro', $any($event.target).value)"/></td>
                  <td class="py-1.5 px-1"><input type="text" placeholder="+/-0.00" [class]="inputCls" [disabled]="disabled()" [value]="value().cercaOICilindro" (input)="set('cercaOICilindro', $any($event.target).value)"/></td>
                  <td class="py-1.5 px-1 text-center text-gray-300 text-xs">—</td>
                </tr>
                <tr>
                  <td class="py-1.5 pr-2 text-xs font-medium text-gray-500">Eje</td>
                  <td class="py-1.5 px-1"><input type="text" placeholder="0°" [class]="inputCls" [disabled]="disabled()" [value]="value().cercaODEje" (input)="set('cercaODEje', $any($event.target).value)"/></td>
                  <td class="py-1.5 px-1"><input type="text" placeholder="0°" [class]="inputCls" [disabled]="disabled()" [value]="value().cercaOIEje" (input)="set('cercaOIEje', $any($event.target).value)"/></td>
                  <td class="py-1.5 px-1 text-center text-gray-300 text-xs">—</td>
                </tr>
              </tbody>
            </table>
            <div class="mt-3 pt-3 border-t border-gray-100">
              <label class="block text-xs font-medium text-gray-500 mb-1">Observación</label>
              <input type="text" maxlength="500" placeholder="Observaciones de cerca..." [class]="inputCls" [disabled]="disabled()"
                     [value]="value().cercaODObservacion" (input)="set('cercaODObservacion', $any($event.target).value)"/>
            </div>
          </div>
        }

      </div>
    }
  `,
})
export class RecetaCristalesFormComponent {
  readonly value = model.required<RecetaState>();
  readonly disabled = input(false);

  readonly inputCls = INP;

  set<K extends keyof RecetaState>(key: K, val: RecetaState[K]): void {
    this.value.update(r => ({ ...r, [key]: val }));
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
    if (checked) { this.value.update(r => ({ ...r, checkLejos: true })); return; }
    this.value.update(r => ({
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
    if (checked) { this.value.update(r => ({ ...r, checkCerca: true })); return; }
    this.value.update(r => ({
      ...r,
      checkCerca: false,
      cercaODEsferico: '', cercaODCilindro: '', cercaODEje: '', cercaODObservacion: '',
      cercaOIEsferico: '', cercaOICilindro: '', cercaOIEje: '', cercaOIObservacion: '',
      cercaDPEsferico: '', cercaDPObservacion: '',
    }));
  }

  onADDChange(value: string): void {
    this.value.update(r => {
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

  onLejosChange(key: LejosKey, value: string): void {
    this.value.update(r => this.applyADD({ ...r, [key]: value }));
  }
}
