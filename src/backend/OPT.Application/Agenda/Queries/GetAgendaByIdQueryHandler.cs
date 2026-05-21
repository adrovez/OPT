using MediatR;
using OPT.Application.Agenda.DTOs;
using OPT.Application.Interfaces;

namespace OPT.Application.Agenda.Queries;

public class GetAgendaByIdQueryHandler(IAgendaRepository repository)
    : IRequestHandler<GetAgendaByIdQuery, AgendaDto?>
{
    public async Task<AgendaDto?> Handle(GetAgendaByIdQuery query, CancellationToken cancellationToken)
    {
        var agenda = await repository.GetByIdAsync(query.AgendaId, query.TenantId, cancellationToken);
        return agenda?.ToDto();
    }
}
