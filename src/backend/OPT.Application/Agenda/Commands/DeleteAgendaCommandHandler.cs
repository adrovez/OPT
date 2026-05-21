using MediatR;
using OPT.Application.Interfaces;

namespace OPT.Application.Agenda.Commands;

public class DeleteAgendaCommandHandler(IAgendaRepository repository)
    : IRequestHandler<DeleteAgendaCommand>
{
    public async Task Handle(DeleteAgendaCommand request, CancellationToken cancellationToken)
        => await repository.SoftDeleteAsync(request.AgendaId, request.TenantId, request.DeletedBy, cancellationToken);
}
