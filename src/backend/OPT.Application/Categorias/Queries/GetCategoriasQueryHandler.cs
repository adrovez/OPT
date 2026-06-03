using MediatR;
using OPT.Application.Categorias.DTOs;
using OPT.Application.Interfaces;

namespace OPT.Application.Categorias.Queries;

public class GetCategoriasQueryHandler(ICategoriaRepository repository)
    : IRequestHandler<GetCategoriasQuery, IReadOnlyList<CategoriaDto>>
{
    public async Task<IReadOnlyList<CategoriaDto>> Handle(
        GetCategoriasQuery request, CancellationToken cancellationToken)
    {
        var categorias = await repository.GetAllAsync(
            request.TenantId, request.SoloActivas, cancellationToken);
        return categorias.Select(c => c.ToDto()).ToList();
    }
}
