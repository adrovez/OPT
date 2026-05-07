using MediatR;

namespace OPT.Application.Contactos.Commands;

/// <summary>Comando para agregar un nuevo contacto a un cliente Empresa.</summary>
public record CreateContactoCommand(
    int TenantId,
    int ClienteId,
    string Nombre,
    string? Email,
    string? Telefono,
    string? Cargo,
    string CreatedBy) : IRequest<int>;
