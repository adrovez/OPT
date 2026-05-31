using MediatR;
using OPT.Application.Interfaces;

namespace OPT.Application.Agenda.Commands;

public class CambiarEstadoAgendaCommandHandler(IAgendaRepository repository)
    : IRequestHandler<CambiarEstadoAgendaCommand>
{
    private static readonly HashSet<string> EstadosValidos =
        ["Ingresado", "Confirmada", "Atendida", "Cancelada", "NoShow"];

    public async Task Handle(CambiarEstadoAgendaCommand request, CancellationToken cancellationToken)
    {
        if (!EstadosValidos.Contains(request.Estado))
            throw new InvalidOperationException(
                $"Estado '{request.Estado}' no es válido. Valores permitidos: {string.Join(", ", EstadosValidos)}.");

        var agenda = await repository.GetByIdAsync(request.AgendaId, request.TenantId, cancellationToken)
            ?? throw new KeyNotFoundException($"Agenda {request.AgendaId} no encontrada.");

        agenda.Estado    = request.Estado;
        agenda.UpdatedAt = DateTime.UtcNow;
        agenda.UpdatedBy = request.UpdatedBy;

        await repository.UpdateAsync(agenda, cancellationToken);
    }
}
