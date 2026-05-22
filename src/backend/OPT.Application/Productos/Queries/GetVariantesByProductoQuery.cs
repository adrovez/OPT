using MediatR;
using OPT.Application.Productos.DTOs;

namespace OPT.Application.Productos.Queries;

public record GetVariantesByProductoQuery(Guid ProductoId, Guid TenantId)
    : IRequest<IReadOnlyList<ProductoVarianteDto>>;
