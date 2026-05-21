using MediatR;

namespace OPT.Application.Agenda.Commands;

public record CreateAgendaCommand(
    Guid TenantId,
    Guid SucursalId,
    Guid ClienteId,
    Guid? UsuarioId,
    DateTime FechaHora,
    short DuracionMinutos,
    string Motivo,
    string? Observaciones,
    string CreatedBy) : IRequest<Guid>;
