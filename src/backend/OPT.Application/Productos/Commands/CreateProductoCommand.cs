using MediatR;

namespace OPT.Application.Productos.Commands;

public record CreateProductoCommand(
    Guid TenantId,
    Guid? CategoriaId,
    string Nombre,
    string? Descripcion,
    string TipoProducto,
    string? CodigoInterno,
    string CreatedBy) : IRequest<Guid>;
