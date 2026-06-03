using StockEntity = OPT.Domain.Entities.Stock;
using OPT.Domain.Entities;

namespace OPT.Application.Stock.DTOs;

public record StockDto(
    Guid StockId,
    Guid ProductoId,
    string ProductoNombre,
    string CodigoInterno,
    Guid SucursalId,
    int CantidadDisponible,
    int StockMinimo,
    bool BajoMinimo);

public record MovimientoStockDto(
    Guid MovimientoId,
    Guid ProductoId,
    string ProductoNombre,
    string TipoMovimiento,
    int Cantidad,
    int CantidadAntes,
    int CantidadDespues,
    string? Referencia,
    string? Observacion,
    DateTime FechaMovimiento,
    string? UsuarioNombre);

internal static class StockMappingExtensions
{
    internal static StockDto ToDto(this StockEntity s) => new(
        StockId:            s.StockId,
        ProductoId:         s.ProductoId,
        ProductoNombre:     s.Producto?.Nombre ?? string.Empty,
        CodigoInterno:      s.Producto?.CodigoInterno ?? string.Empty,
        SucursalId:         s.SucursalId,
        CantidadDisponible: s.CantidadDisponible,
        StockMinimo:        s.StockMinimo,
        BajoMinimo:         s.CantidadDisponible < s.StockMinimo);

    internal static MovimientoStockDto ToDto(this MovimientoStock m) => new(
        MovimientoId:    m.MovimientoId,
        ProductoId:      m.ProductoId,
        ProductoNombre:  m.Producto?.Nombre ?? string.Empty,
        TipoMovimiento:  m.TipoMovimiento,
        Cantidad:        m.Cantidad,
        CantidadAntes:   m.CantidadAntes,
        CantidadDespues: m.CantidadDespues,
        Referencia:      m.Referencia,
        Observacion:     m.Observacion,
        FechaMovimiento: m.FechaMovimiento,
        UsuarioNombre:   m.Usuario?.Nombre);
}
