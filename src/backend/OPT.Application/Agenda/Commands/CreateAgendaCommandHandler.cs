using MediatR;
using OPT.Application.Interfaces;
using AgendaEntity = OPT.Domain.Entities.Agenda;

namespace OPT.Application.Agenda.Commands;

public class CreateAgendaCommandHandler(IAgendaRepository repository)
    : IRequestHandler<CreateAgendaCommand, Guid>
{
    public async Task<Guid> Handle(CreateAgendaCommand request, CancellationToken cancellationToken)
    {
        var agenda = new AgendaEntity
        {
            TenantId        = request.TenantId,
            SucursalId      = request.SucursalId,
            ClienteId       = request.ClienteId,
            UsuarioId       = request.UsuarioId,
            FechaHora       = request.FechaHora,
            DuracionMinutos = request.DuracionMinutos,
            Motivo          = request.Motivo,
            Observaciones   = request.Observaciones,
            Estado          = "Pendiente",
            CreatedBy       = request.CreatedBy
        };

        await repository.AddAsync(agenda, cancellationToken);
        return agenda.AgendaId;
    }
}
