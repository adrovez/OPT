using MediatR;
using OPT.Application.Precios.DTOs;

namespace OPT.Application.Precios.Queries;

public record GetHistorialPreciosQuery(
    Guid ProductoId,
    Guid TenantId) : IRequest<IReadOnlyList<PrecioProductoDto>>;
