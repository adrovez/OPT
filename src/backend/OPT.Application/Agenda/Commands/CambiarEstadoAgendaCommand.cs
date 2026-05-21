using MediatR;

namespace OPT.Application.Agenda.Commands;

public record CambiarEstadoAgendaCommand(
    Guid AgendaId,
    Guid TenantId,
    string Estado,
    string UpdatedBy) : IRequest;
