using MediatR;
using OPT.Application.Common;
using OPT.Application.Precios.DTOs;

namespace OPT.Application.Precios.Queries;

public record GetPreciosVigentesQuery(
    Guid TenantId,
    string? Search,
    Guid? CategoriaId,
    int Page,
    int PageSize) : IRequest<PagedResult<PrecioProductoDto>>;
