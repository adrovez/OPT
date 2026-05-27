using MediatR;
using OPT.Application.Atencion.DTOs;
using OPT.Application.Interfaces;

namespace OPT.Application.Atencion.Queries;

public class GetAtencionByIdQueryHandler(IAtencionRepository repository)
    : IRequestHandler<GetAtencionByIdQuery, AtencionDto?>
{
    public async Task<AtencionDto?> Handle(GetAtencionByIdQuery query, CancellationToken cancellationToken)
    {
        var atencion = await repository.GetByIdAsync(
            query.AtencionId, query.TenantId, cancellationToken);

        return atencion?.ToDto();
    }
}
