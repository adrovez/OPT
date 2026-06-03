using DocumentoEntradaEntity = OPT.Domain.Entities.DocumentoEntrada;
using OPT.Domain.Entities;

namespace OPT.Application.DocumentoEntrada.DTOs;

public record DocumentoEntradaDto(
    Guid DocumentoId,
    string TipoDocumento,
    string? NumeroDocumento,
    DateOnly FechaDocumento,
    string? ProveedorNombre,
    string? ProveedorRut,
    string Estado,
    string? Observaciones,
    DateTime CreatedAt,
    IReadOnlyList<DocumentoEntradaLineaDto> Lineas);

public record DocumentoEntradaLineaDto(
    Guid LineaId,
    Guid ProductoId,
    string ProductoNombre,
    string CodigoInterno,
    int Cantidad,
    decimal? PrecioCosto,
    string? Observaciones);

internal static class DocumentoEntradaMappingExtensions
{
    internal static DocumentoEntradaDto ToDto(this DocumentoEntradaEntity d) => new(
        DocumentoId:     d.DocumentoId,
        TipoDocumento:   d.TipoDocumento,
        NumeroDocumento: d.NumeroDocumento,
        FechaDocumento:  d.FechaDocumento,
        ProveedorNombre: d.ProveedorNombre,
        ProveedorRut:    d.ProveedorRut,
        Estado:          d.Estado,
        Observaciones:   d.Observaciones,
        CreatedAt:       d.CreatedAt,
        Lineas:          d.Lineas.Select(l => l.ToDto()).ToList());

    internal static DocumentoEntradaLineaDto ToDto(this DocumentoEntradaLinea l) => new(
        LineaId:        l.LineaId,
        ProductoId:     l.ProductoId,
        ProductoNombre: l.Producto?.Nombre ?? string.Empty,
        CodigoInterno:  l.Producto?.CodigoInterno ?? string.Empty,
        Cantidad:       l.Cantidad,
        PrecioCosto:    l.PrecioCosto,
        Observaciones:  l.Observaciones);
}
