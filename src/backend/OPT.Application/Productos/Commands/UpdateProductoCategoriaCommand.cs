using MediatR;

namespace OPT.Application.Productos.Commands;

public record UpdateProductoCategoriaCommand(
    Guid CategoriaId,
    Guid TenantId,
    string Nombre,
    string UpdatedBy) : IRequest;
