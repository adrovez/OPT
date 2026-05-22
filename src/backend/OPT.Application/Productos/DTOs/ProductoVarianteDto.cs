namespace OPT.Application.Productos.DTOs;

public record ProductoVarianteDto(
    Guid VarianteId,
    Guid ProductoId,
    Guid TenantId,
    string Nombre,
    string? CodigoBarras,
    bool Activo,
    DateTime CreatedAt,
    DateTime? UpdatedAt,
    string? CreatedBy,
    string? UpdatedBy);
