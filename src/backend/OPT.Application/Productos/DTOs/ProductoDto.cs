namespace OPT.Application.Productos.DTOs;

public record ProductoDto(
    Guid ProductoId,
    Guid TenantId,
    Guid? ProductoPadreId,
    Guid? CategoriaId,
    string? CategoriaNombre,
    string CodigoInterno,
    string Nombre,
    string? Descripcion,
    string Tipo,
    string? UnidadMedida,
    bool IsActivo,
    decimal? PrecioCosto,
    decimal? PrecioVenta,
    IReadOnlyList<ProductoDto> Hijos,
    DateTime CreatedAt,
    DateTime? UpdatedAt,
    string? CreatedBy,
    string? UpdatedBy);
