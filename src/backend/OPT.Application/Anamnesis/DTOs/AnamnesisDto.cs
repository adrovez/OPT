namespace OPT.Application.Anamnesis.DTOs;

/// <summary>DTO de respuesta para listado y detalle de anamnesis.</summary>
public record AnamnesisDto(
    Guid AnamnesisId,
    Guid TenantId,
    Guid ClienteId,
    bool Hipertension,
    bool Diabetes,
    bool Alergias,
    bool UsaLentes,
    string? Observacion,
    DateTime FechaRegistro,
    DateTime CreatedAt,
    DateTime? UpdatedAt,
    string? CreatedBy,
    string? UpdatedBy);
