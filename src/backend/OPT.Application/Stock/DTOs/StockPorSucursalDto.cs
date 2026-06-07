namespace OPT.Application.Stock.DTOs;

public record StockPorSucursalDto(
    Guid SucursalId,
    string SucursalNombre,
    int CantidadDisponible,
    int StockMinimo,
    bool BajoMinimo);
