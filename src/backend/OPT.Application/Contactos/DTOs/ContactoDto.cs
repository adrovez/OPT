namespace OPT.Application.Contactos.DTOs;

/// <summary>DTO de respuesta para listado y detalle de contactos.</summary>
public record ContactoDto(
    int ContactoId,
    int TenantId,
    int ClienteId,
    string Nombre,
    string? Email,
    string? Telefono,
    string? Cargo,
    bool Activo,
    DateTime CreatedAt,
    DateTime? UpdatedAt,
    string? CreatedBy,
    string? UpdatedBy);
