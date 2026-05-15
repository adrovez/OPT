using MediatR;

namespace OPT.Application.RecetaCristales.Commands;

/// <summary>Elimina lógicamente una receta de cristales (IsDeleted = true).</summary>
public record DeleteRecetaCristalesCommand(
    Guid RecetaCristalesId, Guid TenantId, string DeletedBy) : IRequest;
