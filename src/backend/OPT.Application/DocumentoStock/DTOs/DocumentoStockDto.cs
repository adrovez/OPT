using DocumentoStockEntity = OPT.Domain.Entities.DocumentoStock;
using OPT.Domain.Entities;

namespace OPT.Application.DocumentoStock.DTOs;

public record DocumentoStockDto(
    Guid DocumentoId,
    string TipoDocumento,
    string NumeroDocumento,
    DateOnly Fecha,
    string? ProveedorNombre,
    string Estado,
    string? Observacion,
    DateTime CreatedAt,
    IReadOnlyList<DocumentoStockLineaDto> Lineas);

public record DocumentoStockLineaDto(
    Guid LineaId,
    Guid VarianteId,
    string VarianteNombre,
    string ProductoNombre,
    int Cantidad,
    decimal? PrecioCosto);

internal static class DocumentoStockMappingExtensions
{
    internal static DocumentoStockDto ToDto(this DocumentoStockEntity d) => new(
        DocumentoId:     d.DocumentoId,
        TipoDocumento:   d.TipoDocumento,
        NumeroDocumento: d.NumeroDocumento,
        Fecha:           d.Fecha,
        ProveedorNombre: d.ProveedorNombre,
        Estado:          d.Estado,
        Observacion:     d.Observacion,
        CreatedAt:       d.CreatedAt,
        Lineas:          d.Lineas.Select(l => l.ToDto()).ToList());

    internal static DocumentoStockLineaDto ToDto(this DocumentoStockLinea l) => new(
        LineaId:        l.LineaId,
        VarianteId:     l.VarianteId,
        VarianteNombre: l.Variante?.Nombre ?? string.Empty,
        ProductoNombre: l.Variante?.Producto?.Nombre ?? string.Empty,
        Cantidad:       l.Cantidad,
        PrecioCosto:    l.PrecioCosto);
}
