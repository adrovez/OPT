using ProductoCategoriaEntity = OPT.Domain.Entities.ProductoCategoria;
using ProductoEntity = OPT.Domain.Entities.Producto;
using ProductoVarianteEntity = OPT.Domain.Entities.ProductoVariante;

namespace OPT.Application.Productos.DTOs;

public static class ProductoMappingExtensions
{
    public static ProductoCategoriaDto ToDto(this ProductoCategoriaEntity c) => new(
        CategoriaId: c.CategoriaId,
        TenantId: c.TenantId,
        Nombre: c.Nombre,
        CreatedAt: c.CreatedAt,
        UpdatedAt: c.UpdatedAt,
        CreatedBy: c.CreatedBy,
        UpdatedBy: c.UpdatedBy);

    public static ProductoVarianteDto ToDto(this ProductoVarianteEntity v) => new(
        VarianteId: v.VarianteId,
        ProductoId: v.ProductoId,
        TenantId: v.TenantId,
        Nombre: v.Nombre,
        CodigoBarras: v.CodigoBarras,
        Activo: v.Activo,
        CreatedAt: v.CreatedAt,
        UpdatedAt: v.UpdatedAt,
        CreatedBy: v.CreatedBy,
        UpdatedBy: v.UpdatedBy);

    public static ProductoDto ToDto(this ProductoEntity p) => new(
        ProductoId: p.ProductoId,
        TenantId: p.TenantId,
        CategoriaId: p.CategoriaId,
        CategoriaNombre: p.Categoria?.Nombre,
        Nombre: p.Nombre,
        Descripcion: p.Descripcion,
        TipoProducto: p.TipoProducto,
        CodigoInterno: p.CodigoInterno,
        Activo: p.Activo,
        Variantes: p.Variantes.Select(v => v.ToDto()).ToList(),
        CreatedAt: p.CreatedAt,
        UpdatedAt: p.UpdatedAt,
        CreatedBy: p.CreatedBy,
        UpdatedBy: p.UpdatedBy);
}
