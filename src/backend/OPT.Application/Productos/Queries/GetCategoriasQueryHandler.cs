using MediatR;
using OPT.Application.Interfaces;
using OPT.Application.Productos.DTOs;

namespace OPT.Application.Productos.Queries;

public class GetCategoriasQueryHandler(IProductoCategoriaRepository repository)
    : IRequestHandler<GetCategoriasQuery, IReadOnlyList<ProductoCategoriaDto>>
{
    public async Task<IReadOnlyList<ProductoCategoriaDto>> Handle(
        GetCategoriasQuery request, CancellationToken cancellationToken)
    {
        var categorias = await repository.GetAllAsync(request.TenantId, cancellationToken);
        return categorias.Select(c => c.ToDto()).ToList();
    }
}
