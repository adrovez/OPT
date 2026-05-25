using MediatR;
using OPT.Application.Interfaces;

namespace OPT.Application.DocumentoStock.Commands;

public record CrearYConfirmarDocumentoCommand(
    Guid TenantId,
    Guid SucursalId,
    Guid UsuarioId,
    string CreatedBy,
    string TipoDocumento,
    string NumeroDocumento,
    DateOnly Fecha,
    string? ProveedorNombre,
    string? Observacion,
    IReadOnlyList<DocumentoLineaInput> Lineas
) : IRequest<Guid>;

public class CrearYConfirmarDocumentoCommandHandler(
    IDocumentoStockRepository repo) : IRequestHandler<CrearYConfirmarDocumentoCommand, Guid>
{
    public Task<Guid> Handle(CrearYConfirmarDocumentoCommand cmd, CancellationToken ct) =>
        repo.CrearYConfirmarAsync(
            tenantId:        cmd.TenantId,
            sucursalId:      cmd.SucursalId,
            usuarioId:       cmd.UsuarioId,
            tipoDocumento:   cmd.TipoDocumento,
            numeroDocumento: cmd.NumeroDocumento,
            fecha:           cmd.Fecha,
            proveedorNombre: cmd.ProveedorNombre,
            observacion:     cmd.Observacion,
            lineas:          cmd.Lineas,
            createdBy:       cmd.CreatedBy,
            ct:              ct);
}
