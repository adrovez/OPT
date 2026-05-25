using MediatR;

namespace OPT.Application.Stock.Commands;

public record RegistrarMovimientoCommand(
    Guid TenantId,
    Guid SucursalId,
    Guid VarianteId,
    Guid UsuarioId,
    string TipoMovimiento,
    int Cantidad,
    string? Referencia,
    string? Observacion,
    string CreatedBy) : IRequest<Guid>;
