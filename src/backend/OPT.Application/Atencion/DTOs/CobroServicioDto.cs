using CobroServicioEntity = OPT.Domain.Entities.CobroServicio;

namespace OPT.Application.Atencion.DTOs;

public record CobroServicioDto(
    Guid CobroServicioId,
    Guid AtencionId,
    int FormaPagoId,
    string FormaPagoDescripcion,
    decimal Monto,
    DateTime FechaCobro,
    string? Observaciones,
    DateTime CreatedAt);

internal static class CobroServicioMappingExtensions
{
    internal static CobroServicioDto ToDto(this CobroServicioEntity c) => new(
        CobroServicioId:       c.CobroServicioId,
        AtencionId:            c.AtencionId,
        FormaPagoId:           c.FormaPagoId,
        FormaPagoDescripcion:  c.FormaPago?.Descripcion ?? string.Empty,
        Monto:                 c.Monto,
        FechaCobro:            c.FechaCobro,
        Observaciones:         c.Observaciones,
        CreatedAt:             c.CreatedAt);
}
