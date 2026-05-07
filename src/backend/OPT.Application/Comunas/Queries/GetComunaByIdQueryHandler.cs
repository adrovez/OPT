using MediatR;
using OPT.Application.Comunas.DTOs;
using OPT.Application.Interfaces;

namespace OPT.Application.Comunas.Queries;

public class GetComunaByIdQueryHandler(IComunaRepository comunaRepository)
    : IRequestHandler<GetComunaByIdQuery, ComunaDto?>
{
    public async Task<ComunaDto?> Handle(
        GetComunaByIdQuery request, CancellationToken cancellationToken)
    {
        var comuna = await comunaRepository.GetByIdAsync(request.IdComuna, cancellationToken);
        return comuna?.ToDto();
    }
}
