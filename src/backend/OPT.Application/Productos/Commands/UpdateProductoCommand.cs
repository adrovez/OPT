using MediatR;

namespace OPT.Application.Productos.Commands;

public record UpdateProductoCommand(
    Guid ProductoId,
    Guid TenantId,
    string CodigoInterno,
    string Nombre,
    string? Descripcion,
    string Tipo,
    string? UnidadMedida,
    Guid? CategoriaId,
    Guid? ProductoPadreId,
    bool IsActivo,
    string UpdatedBy) : IRequest;
