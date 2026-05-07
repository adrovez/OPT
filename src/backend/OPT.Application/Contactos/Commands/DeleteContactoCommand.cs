using MediatR;

namespace OPT.Application.Contactos.Commands;

/// <summary>Comando para eliminar lógicamente un contacto (IsDeleted = true).</summary>
public record DeleteContactoCommand(
    int ContactoId,
    int TenantId,
    string DeletedBy) : IRequest<Unit>;
