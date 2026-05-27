using MediatR;

namespace OPT.Application.Atencion.Commands;

public record CreateAtencionCommand(
    Guid TenantId,
    Guid SucursalId,
    Guid? AgendaId,
    Guid ClienteId,
    Guid UsuarioAtencionId,
    DateTime FechaHoraAtencion,
    string Motivo,
    string? Observaciones,
    string CreatedBy) : IRequest<Guid>;
