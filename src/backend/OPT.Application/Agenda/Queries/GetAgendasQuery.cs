using MediatR;
using OPT.Application.Agenda.DTOs;

namespace OPT.Application.Agenda.Queries;

public record GetAgendasQuery(
    Guid TenantId,
    Guid SucursalId,
    DateTime? Desde,
    DateTime? Hasta,
    string? Estado,
    Guid? UsuarioId) : IRequest<IReadOnlyList<AgendaDto>>;
