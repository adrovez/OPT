using MediatR;
using OPT.Application.Clientes.DTOs;

namespace OPT.Application.Clientes.Commands;

/// <summary>Comando para crear un nuevo cliente (Persona o Empresa).</summary>
public record CreateClienteCommand(
    Guid TenantId,
    string TipoCliente,
    string NumeroDocumento,
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
    IReadOnlyList<ContactoInputDto>? Contactos,
    string CreatedBy) : IRequest<Guid>;
