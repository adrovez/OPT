using MediatR;
using OPT.Application.Atencion.DTOs;

namespace OPT.Application.Atencion.Queries;

public record GetAtencionesQuery(
    Guid TenantId,
    Guid SucursalId,
    DateTime? Desde,
    DateTime? Hasta,
    string? Estado) : IRequest<IReadOnlyList<AtencionDto>>;
