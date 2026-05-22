using MediatR;

namespace OPT.Application.Productos.Commands;

public record UpdateProductoCommand(
    Guid ProductoId,
    Guid TenantId,
    Guid? CategoriaId,
    string Nombre,
    string? Descripcion,
    string TipoProducto,
    string? CodigoInterno,
    bool Activo,
    string UpdatedBy) : IRequest;
