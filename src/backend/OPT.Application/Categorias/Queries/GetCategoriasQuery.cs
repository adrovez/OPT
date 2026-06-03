using MediatR;
using OPT.Application.Categorias.DTOs;

namespace OPT.Application.Categorias.Queries;

public record GetCategoriasQuery(
    Guid TenantId,
    bool SoloActivas = true) : IRequest<IReadOnlyList<CategoriaDto>>;
