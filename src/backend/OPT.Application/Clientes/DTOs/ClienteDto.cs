namespace OPT.Application.Clientes.DTOs;

/// <summary>DTO de respuesta para listado y detalle de clientes.</summary>
public record ClienteDto(
    int ClienteId,
    int TenantId,
    string TipoCliente,
    string NumeroDocumento,
    string Nombre,
    string? Direccion,
    int? IdComuna,
    string? Celular,
    string? Mail,
    DateTime FechaIngreso,
    // Persona
    DateOnly? FechaNacimiento,
    string? TipoPrevision,
    // Empresa
    string? Giro,
    // Auditoría
    DateTime CreatedAt,
    DateTime? UpdatedAt,
    string? CreatedBy,
    string? UpdatedBy);
