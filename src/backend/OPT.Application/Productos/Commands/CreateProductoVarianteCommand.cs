using MediatR;

namespace OPT.Application.Productos.Commands;

public record CreateProductoVarianteCommand(
    Guid ProductoId,
    Guid TenantId,
    string Nombre,
    string? CodigoBarras,
    string CreatedBy) : IRequest<Guid>;
