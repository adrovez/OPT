using MediatR;

namespace OPT.Application.Atencion.Commands;

public record RegistrarCobroServicioCommand(
    Guid TenantId,
    Guid SucursalId,
    Guid AtencionId,
    int FormaPagoId,
    decimal Monto,
    string? Observaciones,
    string CreatedBy) : IRequest<Guid>;
