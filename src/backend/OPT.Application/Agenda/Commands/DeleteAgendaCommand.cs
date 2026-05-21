using MediatR;

namespace OPT.Application.Agenda.Commands;

public record DeleteAgendaCommand(
    Guid AgendaId,
    Guid TenantId,
    string DeletedBy) : IRequest;
