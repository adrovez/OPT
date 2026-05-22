using MediatR;

namespace OPT.Application.Productos.Commands;

public record CreateProductoCategoriaCommand(
    Guid TenantId,
    string Nombre,
    string CreatedBy) : IRequest<Guid>;
