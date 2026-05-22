using MediatR;

namespace OPT.Application.Productos.Commands;

public record UpdateProductoVarianteCommand(
    Guid VarianteId,
    Guid ProductoId,
    Guid TenantId,
    string Nombre,
    string? CodigoBarras,
    bool Activo,
    string UpdatedBy) : IRequest;
