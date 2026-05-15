using MediatR;
using OPT.Application.Interfaces;
using OPT.Application.RecetaCristales.DTOs;

namespace OPT.Application.RecetaCristales.Queries;

public class GetRecetasByClienteQueryHandler(IRecetaCristalesRepository repository)
    : IRequestHandler<GetRecetasByClienteQuery, IReadOnlyList<RecetaCristalesDto>>
{
    public async Task<IReadOnlyList<RecetaCristalesDto>> Handle(
        GetRecetasByClienteQuery request, CancellationToken cancellationToken)
    {
        var recetas = await repository.GetByClienteAsync(
            request.ClienteId, request.TenantId, cancellationToken);

        return recetas.Select(r => r.ToDto()).ToList();
    }
}
