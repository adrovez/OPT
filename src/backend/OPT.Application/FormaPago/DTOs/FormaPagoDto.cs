using FormaPagoEntity = OPT.Domain.Entities.FormaPago;

namespace OPT.Application.FormaPago.DTOs;

public record FormaPagoDto(int FormaPagoId, string Descripcion);

internal static class FormaPagoMappingExtensions
{
    internal static FormaPagoDto ToDto(this FormaPagoEntity f) =>
        new(f.FormaPagoId, f.Descripcion);
}
