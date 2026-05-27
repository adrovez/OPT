using FormaPagoEntity = OPT.Domain.Entities.FormaPago;

namespace OPT.Application.Interfaces;

public interface IFormaPagoRepository
{
    Task<IReadOnlyList<FormaPagoEntity>> GetAllAsync(CancellationToken ct = default);
}
