namespace OPT.Application.Productos.DTOs;

public record ProductoDto(
    Guid ProductoId,
    Guid TenantId,
    Guid? CategoriaId,
    string? CategoriaNombre,
    string Nombre,
    string? Descripcion,
    string TipoProducto,
    string? CodigoInterno,
    bool Activo,
    IReadOnlyList<ProductoVarianteDto> Variantes,
    DateTime CreatedAt,
    DateTime? UpdatedAt,
    string? CreatedBy,
    string? UpdatedBy);
