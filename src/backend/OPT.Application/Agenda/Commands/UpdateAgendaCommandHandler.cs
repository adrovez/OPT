using MediatR;
using OPT.Application.Interfaces;

namespace OPT.Application.Agenda.Commands;

public class UpdateAgendaCommandHandler(IAgendaRepository repository)
    : IRequestHandler<UpdateAgendaCommand>
{
    public async Task Handle(UpdateAgendaCommand request, CancellationToken cancellationToken)
    {
        var agenda = await repository.GetByIdAsync(request.AgendaId, request.TenantId, cancellationToken)
            ?? throw new KeyNotFoundException($"Agenda {request.AgendaId} no encontrada.");

        agenda.UsuarioId       = request.UsuarioId;
        agenda.FechaHora       = request.FechaHora;
        agenda.DuracionMinutos = request.DuracionMinutos;
        agenda.Motivo          = request.Motivo;
        agenda.Observaciones   = request.Observaciones;
        agenda.UpdatedAt       = DateTime.UtcNow;
        agenda.UpdatedBy       = request.UpdatedBy;

        await repository.UpdateAsync(agenda, cancellationToken);
    }
}
