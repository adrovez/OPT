using MediatR;
using OPT.Application.Agenda.DTOs;

namespace OPT.Application.Agenda.Queries;

public record GetAgendaByIdQuery(Guid AgendaId, Guid TenantId) : IRequest<AgendaDto?>;
