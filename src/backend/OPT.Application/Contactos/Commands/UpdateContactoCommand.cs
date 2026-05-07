using MediatR;

namespace OPT.Application.Contactos.Commands;

/// <summary>Comando para actualizar los datos de un contacto existente.</summary>
public record UpdateContactoCommand(
    int ContactoId,
    int TenantId,
    string Nombre,
    string? Email,
    string? Telefono,
    string? Cargo,
    bool Activo,
    string UpdatedBy) : IRequest<Unit>;
