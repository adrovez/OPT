import { Component, inject, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { AgendaDto, EstadoAgenda } from '../../../core/models/agenda.model';
import { AgendaService } from '../../../core/services/agenda.service';
import { AgendaFormComponent } from '../agenda-form/agenda-form.component';

const DIAS_SEMANA = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
const MONTHS = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

const SLOT_HEIGHT = 60;  // px per 30-min slot
const PX_PER_MIN = 2;    // SLOT_HEIGHT / 30
const START_HOUR = 8;
const END_HOUR = 20;
const SLOTS_COUNT = (END_HOUR - START_HOUR) * 2; // 24 slots

const ESTADO_CLASSES: Record<EstadoAgenda, string> = {
  Pendiente:  'bg-blue-50 border-l-4 border-blue-500 text-blue-900 shadow-sm',
  Confirmada: 'bg-green-50 border-l-4 border-green-500 text-green-900 shadow-sm',
  Atendida:   'bg-gray-100 border-l-4 border-gray-400 text-gray-600 shadow-sm',
  Cancelada:  'bg-red-50 border-l-4 border-red-300 text-red-600 shadow-sm opacity-60',
  NoShow:     'bg-amber-50 border-l-4 border-amber-400 text-amber-800 shadow-sm',
};

function pad(n: number): string {
  return String(n).padStart(2, '0');
}

function toLocalISO(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:00`;
}

function getMondayOf(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const day = d.getDay();
  d.setDate(d.getDate() + (day === 0 ? -6 : 1 - day));
  return d;
}

@Component({
  selector: 'app-agenda-calendar',
  standalone: true,
  imports: [AgendaFormComponent],
  template: `
    <div class="flex flex-col h-full bg-white">

      <!-- Toolbar -->
      <div class="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
        <div class="flex items-center gap-1">
          <button
            type="button"
            (click)="prevWeek()"
            class="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors
                   focus:outline-none focus:ring-2 focus:ring-gray-300"
            aria-label="Semana anterior"
          >
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
            </svg>
          </button>
          <button
            type="button"
            (click)="gotoToday()"
            class="px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100
                   rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300"
            [class.text-blue-600]="isCurrentWeek()"
            [class.font-semibold]="isCurrentWeek()"
          >
            Hoy
          </button>
          <button
            type="button"
            (click)="nextWeek()"
            class="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors
                   focus:outline-none focus:ring-2 focus:ring-gray-300"
            aria-label="Semana siguiente"
          >
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
            </svg>
          </button>
          <span class="ml-2 text-sm font-semibold text-gray-800">{{ weekLabel() }}</span>
        </div>

        <div class="flex items-center gap-3">
          @if (loading()) {
            <svg class="w-4 h-4 animate-spin text-blue-500" fill="none" viewBox="0 0 24 24" aria-hidden="true">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
            </svg>
          }
          <button
            type="button"
            (click)="openNewForm()"
            class="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600
                   hover:bg-blue-700 active:bg-blue-800 rounded-xl transition-colors
                   focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
            </svg>
            Nueva cita
          </button>
        </div>
      </div>

      <!-- Calendario -->
      <div class="flex-1 overflow-auto">

        <!-- Cabecera de días (sticky) -->
        <div
          class="sticky top-0 z-20 bg-white border-b border-gray-200"
          style="display: grid; grid-template-columns: 56px repeat(7, 1fr)"
        >
          <div></div>
          @for (day of days(); track day; let i = $index) {
            <div class="px-2 py-3 text-center border-l border-gray-100">
              <p class="text-xs font-medium text-gray-400 uppercase tracking-wide">{{ diasSemana[i] }}</p>
              <p
                class="text-sm font-bold mt-0.5"
                [class.text-blue-600]="isToday(day)"
                [class.text-gray-900]="!isToday(day)"
              >
                {{ day.getDate() }}
              </p>
              @if (isToday(day)) {
                <div class="w-1.5 h-1.5 rounded-full bg-blue-500 mx-auto mt-0.5"></div>
              }
            </div>
          }
        </div>

        <!-- Grilla de tiempo -->
        <div style="display: grid; grid-template-columns: 56px repeat(7, 1fr)">

          <!-- Columna de etiquetas horarias -->
          <div class="relative select-none" [style.height.px]="totalHeight">
            @for (slot of timeSlots; track slot; let i = $index) {
              @if (i % 2 === 0) {
                <div
                  class="absolute right-2 text-xs text-gray-400 leading-none"
                  [style.top.px]="i * SLOT_HEIGHT - 5"
                >
                  {{ slot }}
                </div>
              }
            }
          </div>

          <!-- Columnas de días -->
          @for (day of days(); track day) {
            <div
              class="relative border-l border-gray-100 cursor-pointer group"
              [style.height.px]="totalHeight"
              (click)="onSlotClick($event, day)"
            >
              <!-- Líneas de hora / media hora -->
              @for (slot of timeSlots; track slot; let i = $index) {
                <div
                  class="absolute inset-x-0 border-t pointer-events-none"
                  [class.border-gray-100]="i % 2 === 0"
                  [class.border-dashed]="i % 2 !== 0"
                  [class.border-gray-50]="i % 2 !== 0"
                  [style.top.px]="i * SLOT_HEIGHT"
                ></div>
              }

              <!-- Indicador de hora actual -->
              @if (isCurrentWeek() && isToday(day) && currentTimeTop() >= 0) {
                <div
                  class="absolute inset-x-0 flex items-center pointer-events-none z-10"
                  [style.top.px]="currentTimeTop()"
                >
                  <div class="w-2 h-2 rounded-full bg-red-500 shrink-0 -ml-1 z-10"></div>
                  <div class="flex-1 h-px bg-red-500"></div>
                </div>
              }

              <!-- Hover hint on empty area -->
              <div class="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none bg-blue-500/5"></div>

              <!-- Citas -->
              @for (cita of citasDia(day); track cita.agendaId) {
                <div
                  [class]="citaClasses(cita)"
                  [style.top.px]="citaTop(cita)"
                  [style.height.px]="citaHeight(cita)"
                  (click)="onCitaClick($event, cita)"
                >
                  <p class="font-semibold truncate leading-tight text-[11px]">{{ cita.clienteNombre }}</p>
                  @if (citaHeight(cita) >= 36) {
                    <p class="truncate text-[10px] opacity-75 mt-0.5">{{ cita.motivo }}</p>
                  }
                  @if (cita.usuarioNombre && citaHeight(cita) >= 54) {
                    <p class="truncate text-[10px] opacity-60 mt-0.5">{{ cita.usuarioNombre }}</p>
                  }
                  @if (cita.estado === 'Confirmada' && citaHeight(cita) >= 44) {
                    <button
                      type="button"
                      (click)="iniciarAtencion($event, cita)"
                      class="mt-1 inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[9px] font-bold
                             bg-green-600 text-white rounded leading-tight hover:bg-green-700 transition-colors"
                    >
                      ▶ Iniciar
                    </button>
                  }
                </div>
              }
            </div>
          }

        </div>
      </div>

      <!-- Modal de formulario -->
      @if (mostrarForm()) {
        <app-agenda-form
          [agendaParaEditar]="citaParaEditar()"
          [fechaHoraInicial]="formFechaHoraInicial()"
          (saved)="onFormSaved()"
          (cancelled)="onFormCancelled()"
        />
      }

    </div>
  `,
})
export class AgendaCalendarComponent {
  private readonly agendaService = inject(AgendaService);
  private readonly router = inject(Router);

  readonly diasSemana = DIAS_SEMANA;
  readonly SLOT_HEIGHT = SLOT_HEIGHT;
  readonly totalHeight = SLOTS_COUNT * SLOT_HEIGHT;

  readonly timeSlots = Array.from({ length: SLOTS_COUNT }, (_, i) => {
    const totalMins = START_HOUR * 60 + i * 30;
    return `${pad(Math.floor(totalMins / 60))}:${pad(totalMins % 60)}`;
  });

  readonly weekStart = signal<Date>(getMondayOf(new Date()));
  readonly citas = signal<AgendaDto[]>([]);
  readonly loading = signal(false);
  readonly mostrarForm = signal(false);
  readonly citaParaEditar = signal<AgendaDto | null>(null);
  readonly formFechaHoraInicial = signal<string | null>(null);

  readonly days = computed(() => {
    const start = this.weekStart();
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(start);
      d.setDate(d.getDate() + i);
      return d;
    });
  });

  readonly weekLabel = computed(() => {
    const [start, end] = [this.days()[0], this.days()[6]];
    const startMonth = start.getMonth() !== end.getMonth() ? ` ${MONTHS[start.getMonth()]}` : '';
    return `${start.getDate()}${startMonth} – ${end.getDate()} ${MONTHS[end.getMonth()]} ${end.getFullYear()}`;
  });

  readonly isCurrentWeek = computed(() => {
    const monday = getMondayOf(new Date());
    const ws = this.weekStart();
    return ws.getTime() === monday.getTime();
  });

  readonly currentTimeTop = computed(() => {
    const now = new Date();
    const h = now.getHours();
    const m = now.getMinutes();
    if (h < START_HOUR || h >= END_HOUR) return -1;
    return (h - START_HOUR) * 60 * PX_PER_MIN + m * PX_PER_MIN;
  });

  constructor() {
    this.loadCitas();
  }

  loadCitas(): void {
    const days = this.days();
    const desde = toLocalISO(days[0]).replace('T', 'T').split('T')[0] + 'T00:00:00';
    const hastaDay = new Date(days[6]);
    hastaDay.setHours(23, 59, 59, 0);
    const hasta = toLocalISO(hastaDay);

    this.loading.set(true);
    this.agendaService.getAll({ desde, hasta }).subscribe({
      next: citas => {
        this.citas.set(citas);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  prevWeek(): void {
    const d = new Date(this.weekStart());
    d.setDate(d.getDate() - 7);
    this.weekStart.set(d);
    this.loadCitas();
  }

  nextWeek(): void {
    const d = new Date(this.weekStart());
    d.setDate(d.getDate() + 7);
    this.weekStart.set(d);
    this.loadCitas();
  }

  gotoToday(): void {
    this.weekStart.set(getMondayOf(new Date()));
    this.loadCitas();
  }

  isToday(day: Date): boolean {
    const today = new Date();
    return (
      day.getDate() === today.getDate() &&
      day.getMonth() === today.getMonth() &&
      day.getFullYear() === today.getFullYear()
    );
  }

  citasDia(day: Date): AgendaDto[] {
    const dayStr = `${day.getFullYear()}-${pad(day.getMonth() + 1)}-${pad(day.getDate())}`;
    return this.citas().filter(c => c.fechaHora.startsWith(dayStr));
  }

  citaTop(cita: AgendaDto): number {
    const d = new Date(cita.fechaHora);
    const mins = (d.getHours() - START_HOUR) * 60 + d.getMinutes();
    return Math.max(0, mins * PX_PER_MIN);
  }

  citaHeight(cita: AgendaDto): number {
    return Math.max(cita.duracionMinutos * PX_PER_MIN - 4, 22);
  }

  citaClasses(cita: AgendaDto): string {
    return `absolute left-1 right-1 rounded-md px-2 py-1 text-xs overflow-hidden cursor-pointer hover:opacity-80 transition-opacity ${ESTADO_CLASSES[cita.estado]}`;
  }

  onSlotClick(event: MouseEvent, day: Date): void {
    const colEl = event.currentTarget as HTMLElement;
    const relY = event.clientY - colEl.getBoundingClientRect().top;
    const slotIndex = Math.floor(relY / SLOT_HEIGHT);
    const minsFromStart = slotIndex * 30;
    const totalMins = START_HOUR * 60 + minsFromStart;

    const fecha = new Date(day);
    fecha.setHours(Math.floor(totalMins / 60), totalMins % 60, 0, 0);

    this.formFechaHoraInicial.set(toLocalISO(fecha));
    this.citaParaEditar.set(null);
    this.mostrarForm.set(true);
  }

  onCitaClick(event: MouseEvent, cita: AgendaDto): void {
    event.stopPropagation();
    this.citaParaEditar.set(cita);
    this.formFechaHoraInicial.set(null);
    this.mostrarForm.set(true);
  }

  openNewForm(): void {
    this.citaParaEditar.set(null);
    this.formFechaHoraInicial.set(null);
    this.mostrarForm.set(true);
  }

  onFormSaved(): void {
    this.mostrarForm.set(false);
    this.loadCitas();
  }

  onFormCancelled(): void {
    this.mostrarForm.set(false);
  }

  iniciarAtencion(event: MouseEvent, cita: AgendaDto): void {
    event.stopPropagation();
    this.router.navigate(['/atenciones/nueva'], { queryParams: { agendaId: cita.agendaId } });
  }
}
