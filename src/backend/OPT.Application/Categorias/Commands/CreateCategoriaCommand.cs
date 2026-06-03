using MediatR;

namespace OPT.Application.Categorias.Commands;

public record CreateCategoriaCommand(
    Guid TenantId,
    string Nombre,
    string? Descripcion,
    string CreatedBy) : IRequest<Guid>;
