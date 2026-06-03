using MediatR;

namespace OPT.Application.Categorias.Commands;

public record UpdateCategoriaCommand(
    Guid CategoriaId,
    Guid TenantId,
    string Nombre,
    string? Descripcion,
    bool IsActivo,
    string UpdatedBy) : IRequest;
