using OPT.Application.Contactos.DTOs;

namespace OPT.Application.Clientes.DTOs;

/// <summary>DTO de respuesta para listado y detalle de clientes.</summary>
public record ClienteDto(
    Guid ClienteId,
    Guid TenantId,
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
    IReadOnlyList<ContactoDto> Contactos,
    // Auditoría
    DateTime CreatedAt,
    DateTime? UpdatedAt,
    string? CreatedBy,
    string? UpdatedBy);
