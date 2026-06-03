namespace OPT.Application.Precios.DTOs;

public record PrecioProductoDto(
    Guid PrecioId,
    Guid ProductoId,
    string ProductoNombre,
    string ProductoCodigo,
    string? CategoriaNombre,
    decimal? PrecioCosto,
    decimal? PrecioVenta,
    DateTime VigenciaDesde,
    DateTime? VigenciaHasta,
    string? CreatedBy);
