using MediatR;
using OPT.Application.Productos.DTOs;

namespace OPT.Application.Productos.Queries;

public record GetCategoriasQuery(Guid TenantId) : IRequest<IReadOnlyList<ProductoCategoriaDto>>;
