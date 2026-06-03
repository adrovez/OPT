using MediatR;
using OPT.Application.Categorias.DTOs;
using OPT.Application.Interfaces;

namespace OPT.Application.Categorias.Queries;

public class GetCategoriaByIdQueryHandler(ICategoriaRepository repository)
    : IRequestHandler<GetCategoriaByIdQuery, CategoriaDto?>
{
    public async Task<CategoriaDto?> Handle(
        GetCategoriaByIdQuery request, CancellationToken cancellationToken)
    {
        var categoria = await repository.GetByIdAsync(
            request.CategoriaId, request.TenantId, cancellationToken);
        return categoria?.ToDto();
    }
}
