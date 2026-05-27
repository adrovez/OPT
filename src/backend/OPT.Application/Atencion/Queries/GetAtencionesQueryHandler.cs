using MediatR;
using OPT.Application.Atencion.DTOs;
using OPT.Application.Interfaces;

namespace OPT.Application.Atencion.Queries;

public class GetAtencionesQueryHandler(IAtencionRepository repository)
    : IRequestHandler<GetAtencionesQuery, IReadOnlyList<AtencionDto>>
{
    public async Task<IReadOnlyList<AtencionDto>> Handle(GetAtencionesQuery query, CancellationToken cancellationToken)
    {
        var items = await repository.GetAllAsync(
            query.TenantId, query.SucursalId,
            query.Desde, query.Hasta, query.Estado,
            cancellationToken);

        return items.Select(a => a.ToDto()).ToList();
    }
}
