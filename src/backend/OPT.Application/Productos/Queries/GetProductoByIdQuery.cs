using MediatR;
using OPT.Application.Productos.DTOs;

namespace OPT.Application.Productos.Queries;

public record GetProductoByIdQuery(Guid ProductoId, Guid TenantId) : IRequest<ProductoDto?>;
