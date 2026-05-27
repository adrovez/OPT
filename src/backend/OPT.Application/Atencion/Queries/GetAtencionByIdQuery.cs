using MediatR;
using OPT.Application.Atencion.DTOs;

namespace OPT.Application.Atencion.Queries;

public record GetAtencionByIdQuery(Guid AtencionId, Guid TenantId) : IRequest<AtencionDto?>;
