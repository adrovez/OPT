using StockEntity = OPT.Domain.Entities.Stock;
using OPT.Domain.Entities;

namespace OPT.Application.Stock.DTOs;

public record StockDto(
    Guid StockId,
    Guid VarianteId,
    string VarianteNombre,
    string ProductoNombre,
    Guid SucursalId,
    int CantidadDisponible,
    int StockMinimo,
    bool BajoMinimo);

public record MovimientoStockDto(
    Guid MovimientoId,
    Guid VarianteId,
    string VarianteNombre,
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
        VarianteId:         s.VarianteId,
        VarianteNombre:     s.Variante?.Nombre ?? string.Empty,
        ProductoNombre:     s.Variante?.Producto?.Nombre ?? string.Empty,
        SucursalId:         s.SucursalId,
        CantidadDisponible: s.CantidadDisponible,
        StockMinimo:        s.StockMinimo,
        BajoMinimo:         s.CantidadDisponible < s.StockMinimo);

    internal static MovimientoStockDto ToDto(this MovimientoStock m) => new(
        MovimientoId:    m.MovimientoId,
        VarianteId:      m.VarianteId,
        VarianteNombre:  m.Variante?.Nombre ?? string.Empty,
        ProductoNombre:  m.Variante?.Producto?.Nombre ?? string.Empty,
        TipoMovimiento:  m.TipoMovimiento,
        Cantidad:        m.Cantidad,
        CantidadAntes:   m.CantidadAntes,
        CantidadDespues: m.CantidadDespues,
        Referencia:      m.Referencia,
        Observacion:     m.Observacion,
        FechaMovimiento: m.FechaMovimiento,
        UsuarioNombre:   m.Usuario?.Nombre);
}
