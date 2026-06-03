using ProductoEntity = OPT.Domain.Entities.Producto;

namespace OPT.Application.Productos.DTOs;

public static class ProductoMappingExtensions
{
    public static ProductoDto ToDto(this ProductoEntity p,
        decimal? precioCosto = null, decimal? precioVenta = null) => new(
        ProductoId:      p.ProductoId,
        TenantId:        p.TenantId,
        ProductoPadreId: p.ProductoPadreId,
        CategoriaId:     p.CategoriaId,
        CategoriaNombre: p.Categoria?.Nombre,
        CodigoInterno:   p.CodigoInterno,
        Nombre:          p.Nombre,
        Descripcion:     p.Descripcion,
        Tipo:            p.Tipo,
        UnidadMedida:    p.UnidadMedida,
        IsActivo:        p.IsActivo,
        PrecioCosto:     precioCosto,
        PrecioVenta:     precioVenta,
        Hijos:           p.Hijos.Select(h => h.ToDto()).ToList(),
        CreatedAt:       p.CreatedAt,
        UpdatedAt:       p.UpdatedAt,
        CreatedBy:       p.CreatedBy,
        UpdatedBy:       p.UpdatedBy);
}
