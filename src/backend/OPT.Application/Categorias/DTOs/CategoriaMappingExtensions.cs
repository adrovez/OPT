using CategoriaEntity = OPT.Domain.Entities.Categoria;

namespace OPT.Application.Categorias.DTOs;

internal static class CategoriaMappingExtensions
{
    internal static CategoriaDto ToDto(this CategoriaEntity c) => new(
        CategoriaId: c.CategoriaId,
        TenantId:    c.TenantId,
        Nombre:      c.Nombre,
        Descripcion: c.Descripcion,
        IsActivo:    c.IsActivo,
        CreatedAt:   c.CreatedAt,
        UpdatedAt:   c.UpdatedAt,
        CreatedBy:   c.CreatedBy,
        UpdatedBy:   c.UpdatedBy);
}
