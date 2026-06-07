using MediatR;
using OPT.Application.Interfaces;
using OPT.Application.Stock.DTOs;
using StockEntity = OPT.Domain.Entities.Stock;

namespace OPT.Application.Stock.Queries;

public record GetStockPorProductoQuery(
    Guid TenantId,
    Guid ProductoId) : IRequest<IReadOnlyList<StockPorSucursalDto>>;

public class GetStockPorProductoQueryHandler(IStockRepository repository)
    : IRequestHandler<GetStockPorProductoQuery, IReadOnlyList<StockPorSucursalDto>>
{
    public async Task<IReadOnlyList<StockPorSucursalDto>> Handle(
        GetStockPorProductoQuery request, CancellationToken cancellationToken)
    {
        var stocks = await repository.GetStockPorProductoAsync(
            request.TenantId, request.ProductoId, cancellationToken);

        return stocks
            .Select(s => new StockPorSucursalDto(
                SucursalId:         s.SucursalId,
                SucursalNombre:     s.Sucursal?.Nombre ?? string.Empty,
                CantidadDisponible: s.CantidadDisponible,
                StockMinimo:        s.StockMinimo,
                BajoMinimo:         s.StockMinimo > 0 && s.CantidadDisponible < s.StockMinimo))
            .ToList();
    }
}
