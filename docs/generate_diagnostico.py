from fpdf import FPDF
from datetime import date

# ── Colores ────────────────────────────────────────────────────────────────────
AZUL_OSCURO  = (13,  27,  61)   # #0D1B3D
AZUL_MEDIO   = (37,  99, 235)   # #2563EB
GRIS_FONDO   = (243, 246, 250)  # #F3F6FA
GRIS_BORDE   = (209, 213, 219)
BLANCO       = (255, 255, 255)
NEGRO        = (17,  24,  39)
ROJO         = (220,  38,  38)
NARANJA      = (234, 88,  12)
VERDE        = (16, 185, 129)
GRIS_TEXTO   = (107, 114, 128)

CUMPLE_COLOR   = (220, 252, 231)   # verde suave
PARCIAL_COLOR  = (254, 243, 199)   # amarillo suave
NOCUMPLE_COLOR = (254, 226, 226)   # rojo suave

CUMPLE_TEXT   = (22, 101,  52)
PARCIAL_TEXT  = (146,  64,  14)
NOCUMPLE_TEXT = (153,  27,  27)


class DiagnosticoPDF(FPDF):
    def __init__(self):
        super().__init__('P', 'mm', 'A4')
        self.set_auto_page_break(auto=True, margin=18)
        self.set_margins(20, 15, 20)

    # ── Header ────────────────────────────────────────────────────────────────
    def header(self):
        if self.page_no() == 1:
            return
        self.set_fill_color(*AZUL_OSCURO)
        self.rect(0, 0, 210, 10, 'F')
        self.set_font('Helvetica', 'B', 7)
        self.set_text_color(*BLANCO)
        self.set_y(2)
        self.cell(0, 6, 'OPT SaaS  |  Diagnostico de Calidad Frontend Angular 21', align='C')
        self.set_text_color(*NEGRO)
        self.ln(8)

    # ── Footer ────────────────────────────────────────────────────────────────
    def footer(self):
        if self.page_no() == 1:
            return
        self.set_y(-12)
        self.set_draw_color(*GRIS_BORDE)
        self.line(20, self.get_y(), 190, self.get_y())
        self.set_font('Helvetica', '', 7)
        self.set_text_color(*GRIS_TEXTO)
        self.cell(0, 6,
                  f'Pagina {self.page_no()}  |  Generado {date.today().strftime("%d/%m/%Y")}',
                  align='C')

    # ── Helpers ───────────────────────────────────────────────────────────────
    def titulo_seccion(self, texto, numero=None):
        self.ln(4)
        self.set_fill_color(*AZUL_OSCURO)
        self.rect(20, self.get_y(), 170, 9, 'F')
        self.set_font('Helvetica', 'B', 11)
        self.set_text_color(*BLANCO)
        prefijo = f'{numero}.  ' if numero else ''
        self.cell(0, 9, f'  {prefijo}{texto}', ln=True)
        self.set_text_color(*NEGRO)
        self.ln(2)

    def subtitulo(self, texto):
        self.ln(3)
        self.set_font('Helvetica', 'B', 10)
        self.set_text_color(*AZUL_MEDIO)
        self.cell(0, 6, texto, ln=True)
        self.set_draw_color(*AZUL_MEDIO)
        self.line(20, self.get_y(), 100, self.get_y())
        self.set_text_color(*NEGRO)
        self.ln(3)

    def parrafo(self, texto, indent=0):
        self.set_font('Helvetica', '', 9)
        self.set_text_color(*NEGRO)
        self.set_x(20 + indent)
        self.multi_cell(170 - indent, 5, texto)
        self.ln(1)

    def bullet(self, texto, nivel=1):
        self.set_font('Helvetica', '', 9)
        self.set_text_color(*NEGRO)
        indent = 6 * nivel
        marker = '-' if nivel == 1 else 'o'
        self.set_x(20 + indent)
        self.multi_cell(170 - indent, 5, f'{marker}  {texto}')

    def badge_veredicto(self, label, color_bg, color_text):
        x0 = self.get_x()
        y0 = self.get_y()
        w = 58
        self.set_fill_color(*color_bg)
        self.set_draw_color(*color_bg)
        self.rect(x0, y0, w, 7, 'F')
        self.set_font('Helvetica', 'B', 8)
        self.set_text_color(*color_text)
        self.cell(w, 7, label, align='C')
        self.set_text_color(*NEGRO)
        self.ln(9)

    def fila_principio(self, simbolo, nombre, veredicto, severidad,
                        pct, evidencia):
        y0 = self.get_y()
        # Fondo alternado
        self.set_fill_color(*GRIS_FONDO)
        self.rect(20, y0, 170, 22, 'F')
        # Simbolo
        self.set_font('Helvetica', 'B', 13)
        self.set_text_color(*AZUL_MEDIO)
        self.set_xy(22, y0 + 5)
        self.cell(12, 8, simbolo)
        # Nombre
        self.set_font('Helvetica', 'B', 9)
        self.set_text_color(*NEGRO)
        self.set_xy(36, y0 + 2)
        self.cell(60, 6, nombre)
        # Veredicto badge
        if 'NO' in veredicto and 'PARCIAL' not in veredicto:
            bc, tc = NOCUMPLE_COLOR, NOCUMPLE_TEXT
        elif 'PARCIAL' in veredicto:
            bc, tc = PARCIAL_COLOR, PARCIAL_TEXT
        else:
            bc, tc = CUMPLE_COLOR, CUMPLE_TEXT
        self.set_fill_color(*bc)
        self.set_font('Helvetica', 'B', 7)
        self.set_text_color(*tc)
        self.set_xy(36, y0 + 9)
        self.cell(56, 5.5, veredicto, align='C', fill=True)
        # Severidad
        self.set_font('Helvetica', '', 8)
        self.set_text_color(*GRIS_TEXTO)
        self.set_xy(96, y0 + 2)
        self.cell(30, 5, f'Severidad: {severidad}')
        self.set_xy(96, y0 + 8)
        self.cell(30, 5, f'Cumplimiento: {pct}')
        # Evidencia
        self.set_font('Helvetica', 'I', 7.5)
        self.set_text_color(*NEGRO)
        self.set_xy(130, y0 + 2)
        self.multi_cell(58, 4.5, evidencia)
        self.set_y(y0 + 23)
        self.set_text_color(*NEGRO)

    def tabla_resumen(self, filas):
        """filas: list of (aspecto, veredicto, severidad)"""
        cols = [80, 60, 30]
        headers = ['Aspecto', 'Veredicto', 'Severidad']
        # Header
        self.set_fill_color(*AZUL_OSCURO)
        self.set_font('Helvetica', 'B', 8)
        self.set_text_color(*BLANCO)
        x0 = 20
        for h, w in zip(headers, cols):
            self.set_x(x0)
            self.cell(w, 7, f'  {h}', fill=True)
            x0 += w
        self.ln()
        # Filas
        self.set_font('Helvetica', '', 8)
        for i, (aspecto, veredicto, severidad) in enumerate(filas):
            bg = GRIS_FONDO if i % 2 == 0 else BLANCO
            self.set_fill_color(*bg)
            if 'NO' in veredicto and 'PARCIAL' not in veredicto:
                vc, vt = NOCUMPLE_COLOR, NOCUMPLE_TEXT
            elif 'PARCIAL' in veredicto:
                vc, vt = PARCIAL_COLOR, PARCIAL_TEXT
            elif 'NO EXISTE' in veredicto:
                vc, vt = NOCUMPLE_COLOR, NOCUMPLE_TEXT
            else:
                vc, vt = CUMPLE_COLOR, CUMPLE_TEXT
            x0 = 20
            self.set_text_color(*NEGRO)
            self.set_x(x0); self.cell(cols[0], 6.5, f'  {aspecto}', fill=True); x0 += cols[0]
            self.set_fill_color(*vc); self.set_text_color(*vt)
            self.set_x(x0); self.cell(cols[1], 6.5, f'  {veredicto}', fill=True); x0 += cols[1]
            self.set_fill_color(*bg); self.set_text_color(*NEGRO)
            self.set_x(x0); self.cell(cols[2], 6.5, f'  {severidad}', fill=True)
            self.ln()
        self.set_text_color(*NEGRO)
        self.ln(3)

    def caja_patron(self, titulo, descripcion, severidad, archivos):
        y0 = self.get_y()
        if y0 > 255:
            self.add_page()
            y0 = self.get_y()
        # borde izq coloreado
        color = ROJO if severidad == 'Grave' else (NARANJA if severidad == 'Media' else AZUL_MEDIO)
        self.set_fill_color(*color)
        self.rect(20, y0, 3, 28, 'F')
        # fondo
        self.set_fill_color(*GRIS_FONDO)
        self.rect(23, y0, 167, 28, 'F')
        # titulo
        self.set_font('Helvetica', 'B', 9)
        self.set_text_color(*NEGRO)
        self.set_xy(26, y0 + 2)
        self.cell(100, 5, titulo)
        # badge severidad
        self.set_fill_color(*color)
        self.set_font('Helvetica', 'B', 7)
        self.set_text_color(*BLANCO)
        self.set_xy(155, y0 + 2)
        self.cell(32, 5, severidad, align='C', fill=True)
        # descripcion
        self.set_font('Helvetica', '', 8)
        self.set_text_color(*NEGRO)
        self.set_xy(26, y0 + 9)
        self.multi_cell(162, 4.5, descripcion)
        # archivos
        self.set_font('Helvetica', 'I', 7.5)
        self.set_text_color(*GRIS_TEXTO)
        self.set_xy(26, y0 + 21)
        self.multi_cell(162, 4, archivos)
        self.set_y(y0 + 30)
        self.set_text_color(*NEGRO)


# ══════════════════════════════════════════════════════════════════════════════
pdf = DiagnosticoPDF()

# ── PORTADA ───────────────────────────────────────────────────────────────────
pdf.add_page()
pdf.set_fill_color(*AZUL_OSCURO)
pdf.rect(0, 0, 210, 297, 'F')

pdf.set_y(55)
pdf.set_font('Helvetica', 'B', 28)
pdf.set_text_color(*BLANCO)
pdf.cell(0, 14, 'DIAGNOSTICO DE CALIDAD', align='C', ln=True)

pdf.set_font('Helvetica', 'B', 18)
pdf.set_text_color(99, 179, 237)
pdf.cell(0, 10, 'Frontend Angular 21', align='C', ln=True)

pdf.ln(4)
pdf.set_draw_color(*AZUL_MEDIO)
pdf.set_line_width(0.8)
pdf.line(55, pdf.get_y(), 155, pdf.get_y())
pdf.ln(6)

pdf.set_font('Helvetica', '', 13)
pdf.set_text_color(203, 213, 225)
pdf.cell(0, 8, 'Analisis SOLID + Arquitectura Limpia', align='C', ln=True)

pdf.ln(16)
# Cuadro resumen rapido
for txt, pct, color_pct in [
    ('Single Responsibility', '15%',  (239,  68,  68)),
    ('Open / Closed',         '20%',  (249, 115,  22)),
    ('Interface Segregation',  '60%',  (250, 204,  21)),
    ('Dependency Inversion',   '50%',  (250, 204,  21)),
    ('Separacion de capas',    '70%',  (250, 204,  21)),
    ('Pureza de modelos',     '100%', ( 52, 211, 153)),
    ('Regla de dependencia',  '100%', ( 52, 211, 153)),
]:
    pdf.set_x(55)
    pdf.set_font('Helvetica', '', 10)
    pdf.set_text_color(203, 213, 225)
    pdf.cell(80, 7, txt)
    pdf.set_font('Helvetica', 'B', 10)
    pdf.set_text_color(*color_pct)
    pdf.cell(30, 7, pct, ln=True)

pdf.ln(10)
pdf.set_font('Helvetica', '', 9)
pdf.set_text_color(148, 163, 184)
pdf.cell(0, 6, f'OPT SaaS  |  {date.today().strftime("%d de %B de %Y")}', align='C', ln=True)


# ══ PAGINA ANALISIS SOLID ═════════════════════════════════════════════════════
pdf.add_page()
pdf.titulo_seccion('ANALISIS SOLID', numero=1)

pdf.parrafo(
    'Se evaluaron los cinco principios SOLID sobre los componentes, servicios y modelos '
    'del frontend. El analisis se baso en lectura directa de codigo con medicion de '
    'responsabilidades, dependencias e inflexibilidades estructurales.'
)

# Tarjetas por principio
principios = [
    ('S', 'Single Responsibility',
     'NO CUMPLE', 'CRITICA', '~15%',
     'Componentes de 715-1913 lineas con 7-12 responsabilidades cada uno.'),
    ('O', 'Open / Closed',
     'NO CUMPLE', 'GRAVE', '~20%',
     'switch/if hardcodeados en deltaDisplay(), estadoBadge(), tipoBadgeClass(). Sin estrategias polimorficas.'),
    ('I', 'Interface Segregation',
     'CUMPLE PARCIALMENTE', 'MEDIA', '~60%',
     'DTOs lista/detalle bien segregados. Pero IniciarAtencionRequest mezcla 3 dominios en 42 campos.'),
    ('D', 'Dependency Inversion',
     'CUMPLE PARCIALMENTE', 'MEDIA', '~50%',
     'Inyeccion con inject() correcta. Sin InjectionToken ni interfaces abstractas. No se puede mockear.'),
]

pdf.ln(2)
for s, n, v, sev, pct, ev in principios:
    pdf.fila_principio(s, n, v, sev, pct, ev)
    pdf.ln(2)

# Tabla resumen SOLID
pdf.subtitulo('Tabla resumen SOLID')
pdf.tabla_resumen([
    ('Single Responsibility', 'NO CUMPLE',          'Critica'),
    ('Open / Closed',         'NO CUMPLE',          'Grave'),
    ('Interface Segregation', 'CUMPLE PARCIALMENTE','Media'),
    ('Dependency Inversion',  'CUMPLE PARCIALMENTE','Media'),
])

# Detalles S
pdf.subtitulo('S — Detalle: God Components')
pdf.parrafo(
    'Los siguientes componentes concentran multiples responsabilidades: estado de UI, '
    'carga HTTP, validacion, calculo, presentacion y orquestacion de servicios.'
)

comp_data = [
    ('orden-trabajo-form.component.ts', '1914 lin.', '9 servicios', '~12 responsabilidades'),
    ('orden-trabajo-detail.component.ts','1166 lin.', '6 servicios', '~11 responsabilidades'),
    ('stock-list.component.ts',          '1208 lin.', '4 servicios', '~12 responsabilidades'),
    ('atencion-detail.component.ts',     '715 lin.',  '4 servicios', '~8 responsabilidades'),
]
# mini tabla
pdf.set_fill_color(*AZUL_OSCURO)
pdf.set_font('Helvetica', 'B', 7.5)
pdf.set_text_color(*BLANCO)
for h, w in [('Componente', 90), ('Lineas', 20), ('Servicios', 30), ('Responsabilidades', 30)]:
    pdf.cell(w, 6, f' {h}', fill=True)
pdf.ln()
for i, (c, l, s, r) in enumerate(comp_data):
    bg = GRIS_FONDO if i % 2 == 0 else BLANCO
    pdf.set_fill_color(*bg)
    pdf.set_font('Helvetica', '', 7.5)
    pdf.set_text_color(*NEGRO)
    pdf.cell(90, 6, f' {c}', fill=True)
    pdf.cell(20, 6, f' {l}', fill=True)
    pdf.cell(30, 6, f' {s}', fill=True)
    pdf.set_fill_color(*NOCUMPLE_COLOR); pdf.set_text_color(*NOCUMPLE_TEXT)
    pdf.cell(30, 6, f' {r}', fill=True)
    pdf.ln()
pdf.set_text_color(*NEGRO)
pdf.ln(4)

# Detalle O
pdf.subtitulo('O — Detalle: Logica condicional no extensible')
pdf.parrafo(
    'En stock-list.component.ts existen tres metodos con switch/case paralelos sobre '
    'TipoMovimiento. Agregar un nuevo tipo requiere editar los tres metodos en el mismo archivo:'
)
pdf.set_fill_color(30, 30, 30)
pdf.set_font('Courier', '', 8)
pdf.set_text_color(200, 250, 200)
pdf.rect(20, pdf.get_y(), 170, 22, 'F')
pdf.set_xy(23, pdf.get_y() + 2)
codigo = ("deltaDisplay(m): string {\n"
          "  switch (m.tipoMovimiento) {\n"
          "    case 'Entrada':             return '+' + m.cantidad;\n"
          "    case 'TransferenciaEntrada':return '+' + m.cantidad;\n"
          "    case 'Salida':              return '-' + m.cantidad;\n"
          "    // Agregar tipo = editar aqui, en deltaClass() y tipoBadgeClass()\n"
          "  }\n"
          "}")
pdf.multi_cell(165, 3.5, codigo)
pdf.set_text_color(*NEGRO)
pdf.ln(4)

# Detalle I
pdf.subtitulo('I — Detalle: Modelo IniciarAtencionRequest (42 campos, 3 dominios)')
pdf.parrafo(
    'El modelo IniciarAtencionRequest en atencion.model.ts mezcla tres dominios distintos '
    'en un solo objeto, obligando a cualquier consumidor a conocer la estructura completa:'
)
for d, c in [('Atencion', 6), ('Anamnesis', 4), ('RecetaCristales', 32)]:
    pdf.set_font('Helvetica', '', 9)
    pdf.set_x(28)
    pdf.set_fill_color(*PARCIAL_COLOR)
    pdf.set_text_color(*PARCIAL_TEXT)
    pdf.cell(60, 5.5, f'  Dominio {d}', fill=True)
    pdf.set_text_color(*NEGRO)
    pdf.set_fill_color(*GRIS_FONDO)
    pdf.cell(40, 5.5, f'  {c} campos', fill=True)
    pdf.ln(6)
pdf.ln(2)

# Detalle D
pdf.subtitulo('D — Detalle: Sin abstracciones de servicio')
pdf.parrafo(
    'Los componentes dependen de clases concretas, no de interfaces. No existe ningun '
    'InjectionToken en el codebase. Esto impide reemplazar implementaciones para tests '
    'sin proveer la clase real.'
)
pdf.bullet('inject(AtencionService)  →  deberia ser inject(ATENCION_SERVICE_TOKEN)')
pdf.bullet('inject(OrdenTrabajoService)  →  deberia ser inject(OT_SERVICE_TOKEN)')
pdf.bullet('No hay interfaces: AtencionServicePort, StockServicePort, etc.')
pdf.ln(3)


# ══ PAGINA ARQUITECTURA LIMPIA ════════════════════════════════════════════════
pdf.add_page()
pdf.titulo_seccion('ANALISIS DE ARQUITECTURA LIMPIA', numero=2)

pdf.parrafo(
    'Se evaluo el cumplimiento de la Regla de Dependencia, la separacion de capas '
    '(Dominio / Casos de Uso / Adaptadores / Infraestructura) y la correcta '
    'asignacion de responsabilidades a cada capa.'
)
pdf.ln(2)

# Diagrama de capas
pdf.set_font('Helvetica', 'B', 8)
pdf.set_text_color(*BLANCO)
capas = [
    (AZUL_OSCURO,  'INFRAESTRUCTURA  (Angular, HttpClient, Router)'),
    (AZUL_MEDIO,   'ADAPTADORES      (Componentes, Servicios HTTP)'),
    ((22, 101, 52),'CASOS DE USO     (Facades, Orquestacion)  ← AUSENTE'),
    ((107,33,168), 'DOMINIO          (Modelos, Reglas de negocio)'),
]
for i, (c, txt) in enumerate(capas):
    margen_extra = i * 10
    self_w = 170 - margen_extra * 2
    pdf.set_fill_color(*c)
    pdf.rect(20 + margen_extra, pdf.get_y(), self_w, 8, 'F')
    pdf.set_x(20 + margen_extra + 3)
    ausente = 'AUSENTE' in txt
    if ausente:
        pdf.set_text_color(255, 200, 50)
    else:
        pdf.set_text_color(*BLANCO)
    pdf.cell(self_w - 6, 8, txt)
    pdf.ln(8)
pdf.set_text_color(*NEGRO)
pdf.ln(4)

# Tabla por aspecto
pdf.subtitulo('Evaluacion por aspecto')
pdf.tabla_resumen([
    ('Separacion de capas (Dominio/UseCase/Adapter)', 'CUMPLE PARCIALMENTE', 'Media'),
    ('Pureza de modelos (sin imports Angular)',         'CUMPLE',             '—'),
    ('Servicios = solo wrappers HTTP',                 'CUMPLE',             '—'),
    ('Regla de dependencia (no inversiones)',           'CUMPLE',             '—'),
    ('Estado encapsulado (signals locales)',            'CUMPLE',             '—'),
    ('Modulo core/ bien estructurado',                 'CUMPLE',             '—'),
    ('Capa de Casos de Uso / Facades',                 'NO EXISTE',          'Grave'),
    ('Mappers DTO ↔ Dominio',                          'NO EXISTE',          'Baja'),
])

# Fortalezas
pdf.subtitulo('Fortalezas detectadas')
for f in [
    'Modelos puros: 18 archivos en core/models/ sin ninguna importacion de Angular.',
    'Servicios delgados: ningun servicio supera 90 lineas, todos son wrappers HTTP.',
    'Regla de dependencia respetada: cero importaciones inversas, cero cruces entre features.',
    'Estado moderno: uso correcto de Angular Signals para estado local de componentes.',
    'Interceptor de autenticacion: JWT inyectado automaticamente via auth.interceptor.ts.',
    'Guards bien ubicados: auth.guard.ts como CanActivateFn, limpio y sin logica extra.',
]:
    pdf.bullet(f)
pdf.ln(3)

# Patrones problematicos
pdf.subtitulo('Patrones problematicos')

pdf.caja_patron(
    '1. Orquestacion multi-servicio en componentes',
    'orden-trabajo-form carga el OT y, dentro del subscribe(), lanza otra llamada para '
    'cargar la receta. Suscripcion anidada en un componente de 1914 lineas. Deberia '
    'existir un CargarOrdenTrabajoUseCase o OrdenTrabajoFacade.',
    'Grave',
    'orden-trabajo-form.component.ts  lineas 1353-1414'
)

pdf.caja_patron(
    '2. Validacion de negocio en componentes',
    'La logica de validacion por tab (puedeAvanzar, recetaEsValida, etc.) vive como '
    'computed() dentro del componente. No es reutilizable y mezcla presentacion con '
    'reglas de negocio.',
    'Media',
    'orden-trabajo-form.component.ts  lineas 1257-1306\n'
    'atencion-detail.component.ts     lineas 451-463'
)

pdf.caja_patron(
    '3. Ausencia total de la capa de Casos de Uso',
    'No existe ninguna carpeta core/use-cases/, core/facades/ ni similar. '
    'Los componentes inyectan directamente 4-9 servicios y los coordinan ellos mismos. '
    'Esto es la raiz comun del problema SOLID-S y del incumplimiento de Clean Architecture.',
    'Grave',
    'orden-trabajo-form.component.ts  (9 servicios inyectados)\n'
    'orden-trabajo-detail.component.ts (6 servicios inyectados)'
)

pdf.caja_patron(
    '4. Modelos = DTOs del API (sin capa de mapeo)',
    'No hay separacion entre el modelo de dominio y el DTO HTTP. '
    'Si el API cambia un nombre de campo, el cambio se propaga directamente a todos los '
    'componentes. Impacto bajo mientras el API sea estable.',
    'Baja',
    'core/models/*.ts  (18 archivos, todos son DTOs del API directamente)'
)

pdf.ln(2)

# ══ CONCLUSIONES ══════════════════════════════════════════════════════════════
pdf.add_page()
pdf.titulo_seccion('CONCLUSIONES Y PLAN DE MEJORA', numero=3)

# Scorecards
pdf.subtitulo('Calificacion global')
scores = [
    ('SOLID',                '4.0 / 10', NOCUMPLE_COLOR, NOCUMPLE_TEXT),
    ('Arquitectura Limpia',  '6.5 / 10', PARCIAL_COLOR,  PARCIAL_TEXT),
    ('Calidad general',      '5.0 / 10', PARCIAL_COLOR,  PARCIAL_TEXT),
]
for nombre, score, bc, tc in scores:
    pdf.set_font('Helvetica', 'B', 10)
    pdf.set_text_color(*NEGRO)
    pdf.set_x(20)
    pdf.cell(80, 9, nombre)
    pdf.set_fill_color(*bc)
    pdf.set_font('Helvetica', 'B', 11)
    pdf.set_text_color(*tc)
    pdf.cell(50, 9, score, align='C', fill=True)
    pdf.ln(11)
pdf.set_text_color(*NEGRO)
pdf.ln(3)

pdf.subtitulo('Causa raiz')
pdf.parrafo(
    'Ambos diagnosticos (SOLID y Arquitectura Limpia) comparten la misma causa raiz: '
    'la ausencia de una capa intermedia entre los servicios HTTP y los componentes. '
    'Sin Facades ni Use Cases, toda la orquestacion, validacion y estado '
    'recaen en los componentes, generando God Components que violan SRP, '
    'impiden el testeo unitario y acumulan deuda tecnica.'
)

pdf.subtitulo('Hoja de ruta recomendada (prioridad)')
pasos = [
    ('1', 'ALTA',   'Crear capa core/use-cases/ o core/facades/',
     'Un facade por modulo grande (OrdenTrabajoFacade, AtencionFacade, StockFacade). '
     'Mueve la orquestacion multi-servicio y la logica de carga fuera de los componentes.'),
    ('2', 'ALTA',   'Descomponer los God Components',
     'orden-trabajo-form (1914 lin) → 1 orquestador + sub-componentes por tab. '
     'Aplicar el mismo patron que RecetaCristalesFormComponent (ya implementado).'),
    ('3', 'MEDIA',  'Centralizar validaciones',
     'Crear core/validators/ para logica de validacion de negocio reutilizable '
     '(ValidarOrdenTrabajo, ValidarAtencion). Reemplazar computed() inline.'),
    ('4', 'MEDIA',  'Agregar InjectionToken para servicios criticos',
     'Al menos para AtencionService y OrdenTrabajoService. Permite mockeo en tests '
     'sin clase concreta.'),
    ('5', 'BAJA',   'Estandarizar mapeo DTO ↔ Dominio',
     'Agregar core/mappers/ con funciones puras de transformacion. '
     'Amortigua cambios del API sin impactar componentes.'),
]
for num, prio, titulo, desc in pasos:
    y0 = pdf.get_y()
    if y0 > 260:
        pdf.add_page()
    c_prio = NOCUMPLE_COLOR if prio == 'ALTA' else (PARCIAL_COLOR if prio == 'MEDIA' else CUMPLE_COLOR)
    t_prio = NOCUMPLE_TEXT  if prio == 'ALTA' else (PARCIAL_TEXT  if prio == 'MEDIA' else CUMPLE_TEXT)
    # numero
    pdf.set_fill_color(*AZUL_OSCURO)
    pdf.set_font('Helvetica', 'B', 10)
    pdf.set_text_color(*BLANCO)
    pdf.set_x(20)
    pdf.cell(9, 18, num, align='C', fill=True)
    # prioridad
    pdf.set_fill_color(*c_prio)
    pdf.set_font('Helvetica', 'B', 7)
    pdf.set_text_color(*t_prio)
    pdf.cell(16, 18, prio, align='C', fill=True)
    # contenido
    pdf.set_fill_color(*GRIS_FONDO)
    x_cont = pdf.get_x()
    pdf.set_text_color(*NEGRO)
    pdf.cell(145, 18, '', fill=True)
    pdf.set_xy(x_cont + 2, y0 + 1)
    pdf.set_font('Helvetica', 'B', 9)
    pdf.cell(140, 6, titulo)
    pdf.set_xy(x_cont + 2, y0 + 8)
    pdf.set_font('Helvetica', '', 8)
    pdf.set_text_color(*GRIS_TEXTO)
    pdf.multi_cell(140, 4.5, desc)
    pdf.set_y(y0 + 20)
    pdf.set_text_color(*NEGRO)

pdf.ln(4)
pdf.subtitulo('Nota positiva')
pdf.parrafo(
    'La base estructural del proyecto es solida: la separacion modelos/servicios/componentes '
    'es correcta, la regla de dependencia se respeta, los servicios HTTP son delgados y el '
    'uso de Angular Signals es moderno y consistente. La refactorizacion de RecetaCristalesForm '
    '(Junio 2026) demuestra que el equipo aplica correctamente los patrones cuando los '
    'identifica. Extender ese mismo patron a los modulos mas grandes es el siguiente paso natural.'
)

# ── Guardar ────────────────────────────────────────────────────────────────────
salida = 'docs/diagnostico-calidad-frontend.pdf'
pdf.output(salida)
print(f'PDF generado: {salida}')
