namespace OPT.Application.Categorias.DTOs;

public record CategoriaDto(
    Guid CategoriaId,
    Guid TenantId,
    string Nombre,
    string? Descripcion,
    bool IsActivo,
    DateTime CreatedAt,
    DateTime? UpdatedAt,
    string? CreatedBy,
    string? UpdatedBy);
