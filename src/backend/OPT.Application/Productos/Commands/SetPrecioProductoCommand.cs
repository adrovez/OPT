using MediatR;

namespace OPT.Application.Productos.Commands;

public record SetPrecioProductoCommand(
    Guid ProductoId,
    Guid TenantId,
    decimal? PrecioCosto,
    decimal? PrecioVenta,
    string CreatedBy) : IRequest;
