using MediatR;
using OPT.Application.Agenda.DTOs;
using OPT.Application.Interfaces;

namespace OPT.Application.Agenda.Queries;

public class GetAgendasQueryHandler(IAgendaRepository repository)
    : IRequestHandler<GetAgendasQuery, IReadOnlyList<AgendaDto>>
{
    public async Task<IReadOnlyList<AgendaDto>> Handle(GetAgendasQuery query, CancellationToken cancellationToken)
    {
        var agendas = await repository.GetAllAsync(
            query.TenantId, query.SucursalId,
            query.Desde, query.Hasta,
            query.Estado, query.UsuarioId,
            cancellationToken);

        return agendas.Select(a => a.ToDto()).ToList();
    }
}
