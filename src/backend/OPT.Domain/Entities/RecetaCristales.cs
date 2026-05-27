namespace OPT.Domain.Entities;

/// <summary>
/// Receta óptica de un cliente (lejos, cerca, DP y ADD).
/// Pertenece a un Tenant y está asociada a un Cliente.
/// Puede estar vinculada a una Atención cuando se implemente OPT_Atencion.
/// </summary>
public class RecetaCristales
{
    public Guid RecetaCristalesId { get; set; }
    public Guid TenantId { get; set; }
    public Guid ClienteId { get; set; }

    // ── Lejos — Ojo Derecho (OD) ─────────────────────────────────────────
    public string? LejosODEsferico { get; set; }
    public string? LejosODCilindro { get; set; }
    public string? LejosODEje { get; set; }
    public string? LejosODObservacion { get; set; }

    // ── Lejos — Ojo Izquierdo (OI) ───────────────────────────────────────
    public string? LejosOIEsferico { get; set; }
    public string? LejosOICilindro { get; set; }
    public string? LejosOIEje { get; set; }
    public string? LejosOIObservacion { get; set; }

    // ── Lejos — Distancia Pupilar (DP) ───────────────────────────────────
    public string? LejosDPEsferico { get; set; }
    public string? LejosDPObservacion { get; set; }

    // ── Cerca — Ojo Derecho (OD) ─────────────────────────────────────────
    public string? CercaODEsferico { get; set; }
    public string? CercaODCilindro { get; set; }
    public string? CercaODEje { get; set; }
    public string? CercaODObservacion { get; set; }

    // ── Cerca — Ojo Izquierdo (OI) ───────────────────────────────────────
    public string? CercaOIEsferico { get; set; }
    public string? CercaOICilindro { get; set; }
    public string? CercaOIEje { get; set; }
    public string? CercaOIObservacion { get; set; }

    // ── Cerca — Distancia Pupilar (DP) ───────────────────────────────────
    public string? CercaDPEsferico { get; set; }
    public string? CercaDPObservacion { get; set; }

    // ── Adición (ADD) — bifocales/progresivos ────────────────────────────
    public string? LejosADDEsfera { get; set; }

    // ── Flags de comportamiento ───────────────────────────────────────────
    public bool CheckLejos { get; set; } = false;
    public bool CheckCerca { get; set; } = false;
    public bool CheckCristalesLaboratorio { get; set; } = false;
    public bool CheckUrgente { get; set; } = false;

    /// <summary>Fecha de ingreso de la receta (UTC).</summary>
    public DateTime FechaIngreso { get; set; } = DateTime.UtcNow;

    public Guid? AtencionId { get; set; }

    /// <summary>'Consulta' = creada en el sistema | 'Tercero' = prescripción externa ingresada en OT.</summary>
    public string Fuente { get; set; } = "Consulta";

    // ── Navegación ────────────────────────────────────────────────────────
    public Cliente Cliente { get; set; } = null!;
    public Atencion? Atencion { get; set; }

    // ── Auditoría ─────────────────────────────────────────────────────────
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
    public string? CreatedBy { get; set; }
    public string? UpdatedBy { get; set; }
    public bool IsDeleted { get; set; } = false;
}
