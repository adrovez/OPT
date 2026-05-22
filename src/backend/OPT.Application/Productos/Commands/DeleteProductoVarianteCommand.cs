using MediatR;

namespace OPT.Application.Productos.Commands;

public record DeleteProductoVarianteCommand(
    Guid VarianteId,
    Guid TenantId,
    string DeletedBy) : IRequest;
