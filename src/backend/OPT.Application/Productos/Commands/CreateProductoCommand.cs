using MediatR;

namespace OPT.Application.Productos.Commands;

public record CreateProductoCommand(
    Guid TenantId,
    string CodigoInterno,
    string Nombre,
    string? Descripcion,
    string Tipo,
    string? UnidadMedida,
    Guid? CategoriaId,
    Guid? ProductoPadreId,
    string CreatedBy) : IRequest<Guid>;
