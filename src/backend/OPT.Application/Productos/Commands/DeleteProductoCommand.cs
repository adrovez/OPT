using MediatR;

namespace OPT.Application.Productos.Commands;

public record DeleteProductoCommand(
    Guid ProductoId,
    Guid TenantId,
    string DeletedBy) : IRequest;
