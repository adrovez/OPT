using MediatR;
using OPT.Application.Interfaces;
using OPT.Application.RecetaCristales.DTOs;

namespace OPT.Application.RecetaCristales.Queries;

public class GetRecetaByIdQueryHandler(IRecetaCristalesRepository repository)
    : IRequestHandler<GetRecetaByIdQuery, RecetaCristalesDto?>
{
    public async Task<RecetaCristalesDto?> Handle(
        GetRecetaByIdQuery request, CancellationToken cancellationToken)
    {
        var receta = await repository.GetByIdAsync(
            request.RecetaCristalesId, request.TenantId, cancellationToken);

        return receta?.ToDto();
    }
}
