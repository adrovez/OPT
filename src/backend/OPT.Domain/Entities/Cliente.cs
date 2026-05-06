namespace OPT.Domain.Entities;

/// <summary>
/// Representa un cliente del sistema (Persona o Empresa).
/// Cada cliente pertenece a un Tenant específico (aislamiento multi-tenant).
/// </summary>
public class Cliente
{
    public int ClienteId { get; set; }
    public int TenantId { get; set; }

    /// <summary>'Persona' o 'Empresa'</summary>
    public string TipoCliente { get; set; } = string.Empty;

    /// <summary>RUT del cliente (único por Tenant, soft-deleted excluido)</summary>
    public string NumeroDocumento { get; set; } = string.Empty;

    public string Nombre { get; set; } = string.Empty;
    public string? Direccion { get; set; }
    public int? IdComuna { get; set; }
    public string? Celular { get; set; }
    public string? Mail { get; set; }
    public DateTime FechaIngreso { get; set; } = DateTime.UtcNow;

    // Campos específicos Persona
    public DateOnly? FechaNacimiento { get; set; }

    /// <summary>'Fonasa', 'Isapre', 'Particular', etc.</summary>
    public string? TipoPrevision { get; set; }

    // Campos específicos Empresa
    public string? Giro { get; set; }

    // Auditoría
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
    public string? CreatedBy { get; set; }
    public string? UpdatedBy { get; set; }
    public bool IsDeleted { get; set; } = false;
}
