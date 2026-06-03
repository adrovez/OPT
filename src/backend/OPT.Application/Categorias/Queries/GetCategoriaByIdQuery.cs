using MediatR;
using OPT.Application.Categorias.DTOs;

namespace OPT.Application.Categorias.Queries;

public record GetCategoriaByIdQuery(Guid CategoriaId, Guid TenantId) : IRequest<CategoriaDto?>;
