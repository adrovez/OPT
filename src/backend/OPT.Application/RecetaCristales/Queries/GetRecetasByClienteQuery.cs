using MediatR;
using OPT.Application.RecetaCristales.DTOs;

namespace OPT.Application.RecetaCristales.Queries;

/// <summary>Retorna todas las recetas activas de un cliente dentro del tenant.</summary>
public record GetRecetasByClienteQuery(Guid ClienteId, Guid TenantId)
    : IRequest<IReadOnlyList<RecetaCristalesDto>>;
