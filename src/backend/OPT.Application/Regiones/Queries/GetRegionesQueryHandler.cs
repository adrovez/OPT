using MediatR;
using OPT.Application.Interfaces;
using OPT.Application.Regiones.DTOs;

namespace OPT.Application.Regiones.Queries;

public class GetRegionesQueryHandler(IRegionRepository regionRepository)
    : IRequestHandler<GetRegionesQuery, IReadOnlyList<RegionDto>>
{
    public async Task<IReadOnlyList<RegionDto>> Handle(
        GetRegionesQuery request, CancellationToken cancellationToken)
    {
        var regiones = await regionRepository.GetAllAsync(cancellationToken);
        return regiones.Select(r => r.ToDto()).ToList();
    }
}
