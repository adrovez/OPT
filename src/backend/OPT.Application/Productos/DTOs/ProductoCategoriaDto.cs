namespace OPT.Application.Productos.DTOs;

public record ProductoCategoriaDto(
    Guid CategoriaId,
    Guid TenantId,
    string Nombre,
    DateTime CreatedAt,
    DateTime? UpdatedAt,
    string? CreatedBy,
    string? UpdatedBy);
