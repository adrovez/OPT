namespace OPT.Domain.Entities;

/// <summary>
/// Registra los antecedentes de salud de un Cliente en el momento de la atención.
/// Cada registro pertenece a un Tenant y a un Cliente específico.
/// Permite múltiples registros por cliente a lo largo del tiempo.
/// </summary>
public class Anamnesis
{
    public Guid AnamnesisId { get; set; }
    public Guid TenantId { get; set; }
    public Guid ClienteId { get; set; }

    // ── Antecedentes de salud ─────────────────────────────────────────────
    public bool Hipertension { get; set; } = false;
    public bool Diabetes { get; set; } = false;
    public bool Alergias { get; set; } = false;
    public bool UsaLentes { get; set; } = false;

    /// <summary>Observaciones libres del operador.</summary>
    public string? Observacion { get; set; }

    /// <summary>Fecha en que se registró la anamnesis (UTC).</summary>
    public DateTime FechaRegistro { get; set; } = DateTime.UtcNow;

    // ── Navegación ────────────────────────────────────────────────────────
    public Cliente Cliente { get; set; } = null!;

    // ── Auditoría ─────────────────────────────────────────────────────────
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
    public string? CreatedBy { get; set; }
    public string? UpdatedBy { get; set; }
    public bool IsDeleted { get; set; } = false;
}
