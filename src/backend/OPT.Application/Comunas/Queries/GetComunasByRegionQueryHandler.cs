using MediatR;
using OPT.Application.Comunas.DTOs;
using OPT.Application.Interfaces;

namespace OPT.Application.Comunas.Queries;

public class GetComunasByRegionQueryHandler(IComunaRepository comunaRepository)
    : IRequestHandler<GetComunasByRegionQuery, IReadOnlyList<ComunaDto>>
{
    public async Task<IReadOnlyList<ComunaDto>> Handle(
        GetComunasByRegionQuery request, CancellationToken cancellationToken)
    {
        var comunas = await comunaRepository.GetByRegionAsync(request.IdRegion, cancellationToken);
        return comunas.Select(c => c.ToDto()).ToList();
    }
}
