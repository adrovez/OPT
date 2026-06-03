using MediatR;
using OPT.Application.Common;
using OPT.Application.Productos.DTOs;

namespace OPT.Application.Productos.Queries;

public record GetProductosQuery(
    Guid TenantId,
    string? Tipo,
    Guid? CategoriaId,
    bool SoloRaices,
    Guid? PadreId,
    string? Busqueda,
    int Page,
    int PageSize) : IRequest<PagedResult<ProductoDto>>;
