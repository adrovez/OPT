using MediatR;
using OPT.Application.Interfaces;
using OPT.Application.Regiones.DTOs;

namespace OPT.Application.Regiones.Queries;

public class GetRegionesWithComunasQueryHandler(IRegionRepository regionRepository)
    : IRequestHandler<GetRegionesWithComunasQuery, IReadOnlyList<RegionWithComunasDto>>
{
    public async Task<IReadOnlyList<RegionWithComunasDto>> Handle(
        GetRegionesWithComunasQuery request, CancellationToken cancellationToken)
    {
        var regiones = await regionRepository.GetAllWithComunasAsync(cancellationToken);

        return regiones
            .Select(r => new RegionWithComunasDto(
                r.IdRegion,
                r.Nombre,
                r.Codigo,
                r.Comunas
                    .Select(c => new ComunaItemDto(c.IdComuna, c.Nombre))
                    .ToList()))
            .ToList();
    }
}
