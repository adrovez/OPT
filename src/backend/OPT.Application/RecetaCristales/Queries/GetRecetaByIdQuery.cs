using MediatR;
using OPT.Application.RecetaCristales.DTOs;

namespace OPT.Application.RecetaCristales.Queries;

/// <summary>Retorna el detalle de una receta de cristales por ID.</summary>
public record GetRecetaByIdQuery(Guid RecetaCristalesId, Guid TenantId)
    : IRequest<RecetaCristalesDto?>;
