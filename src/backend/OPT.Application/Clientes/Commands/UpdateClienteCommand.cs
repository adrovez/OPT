using MediatR;

namespace OPT.Application.Clientes.Commands;

/// <summary>Comando para actualizar datos de un cliente existente.</summary>
public record UpdateClienteCommand(
    int ClienteId,
    int TenantId,
    string Nombre,
    string? Direccion,
    int? IdComuna,
    string? Celular,
    string? Mail,
    // Persona
    DateOnly? FechaNacimiento,
    string? TipoPrevision,
    // Empresa
    string? Giro,
    string UpdatedBy) : IRequest;
