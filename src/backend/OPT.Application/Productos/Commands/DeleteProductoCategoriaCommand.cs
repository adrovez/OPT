using MediatR;

namespace OPT.Application.Productos.Commands;

public record DeleteProductoCategoriaCommand(
    Guid CategoriaId,
    Guid TenantId,
    string DeletedBy) : IRequest;
