using MediatR;

namespace OPT.Application.Categorias.Commands;

public record DeleteCategoriaCommand(
    Guid CategoriaId,
    Guid TenantId,
    string DeletedBy) : IRequest;
