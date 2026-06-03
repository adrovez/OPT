using TransferenciaEntity = OPT.Domain.Entities.Transferencia;
using OPT.Domain.Entities;

namespace OPT.Application.Transferencia.DTOs;

public record TransferenciaDto(
    Guid TransferenciaId,
    Guid SucursalOrigenId,
    string? SucursalOrigenNombre,
    Guid SucursalDestinoId,
    string? SucursalDestinoNombre,
    DateOnly FechaTransferencia,
    string Estado,
    string? Observaciones,
    DateTime CreatedAt,
    IReadOnlyList<TransferenciaLineaDto> Lineas);

public record TransferenciaLineaDto(
    Guid LineaId,
    Guid ProductoId,
    string ProductoNombre,
    string CodigoInterno,
    int Cantidad);

internal static class TransferenciaMappingExtensions
{
    internal static TransferenciaDto ToDto(this TransferenciaEntity t) => new(
        TransferenciaId:        t.TransferenciaId,
        SucursalOrigenId:       t.SucursalOrigenId,
        SucursalOrigenNombre:   t.SucursalOrigen?.Nombre,
        SucursalDestinoId:      t.SucursalDestinoId,
        SucursalDestinoNombre:  t.SucursalDestino?.Nombre,
        FechaTransferencia:     t.FechaTransferencia,
        Estado:                 t.Estado,
        Observaciones:          t.Observaciones,
        CreatedAt:              t.CreatedAt,
        Lineas:                 t.Lineas.Select(l => l.ToDto()).ToList());

    internal static TransferenciaLineaDto ToDto(this TransferenciaLinea l) => new(
        LineaId:       l.LineaId,
        ProductoId:    l.ProductoId,
        ProductoNombre: l.Producto?.Nombre ?? string.Empty,
        CodigoInterno: l.Producto?.CodigoInterno ?? string.Empty,
        Cantidad:      l.Cantidad);
}
