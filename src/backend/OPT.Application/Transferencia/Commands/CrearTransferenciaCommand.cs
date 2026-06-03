using MediatR;
using OPT.Application.Interfaces;

namespace OPT.Application.Transferencia.Commands;

public record CrearTransferenciaCommand(
    Guid TenantId,
    Guid SucursalOrigenId,
    Guid SucursalDestinoId,
    DateOnly FechaTransferencia,
    string? Observaciones,
    IReadOnlyList<TransferenciaLineaInput> Lineas,
    Guid UsuarioId,
    string CreatedBy) : IRequest<Guid>;
