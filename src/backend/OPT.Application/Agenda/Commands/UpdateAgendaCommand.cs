using MediatR;

namespace OPT.Application.Agenda.Commands;

public record UpdateAgendaCommand(
    Guid AgendaId,
    Guid TenantId,
    Guid? UsuarioId,
    DateTime FechaHora,
    short DuracionMinutos,
    string Motivo,
    string? Observaciones,
    string UpdatedBy) : IRequest;
