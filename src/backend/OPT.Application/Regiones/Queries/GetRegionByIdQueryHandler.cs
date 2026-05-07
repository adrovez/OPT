using MediatR;
using OPT.Application.Interfaces;
using OPT.Application.Regiones.DTOs;

namespace OPT.Application.Regiones.Queries;

public class GetRegionByIdQueryHandler(IRegionRepository regionRepository)
    : IRequestHandler<GetRegionByIdQuery, RegionDto?>
{
    public async Task<RegionDto?> Handle(
        GetRegionByIdQuery request, CancellationToken cancellationToken)
    {
        var region = await regionRepository.GetByIdAsync(request.IdRegion, cancellationToken);
        return region?.ToDto();
    }
}
