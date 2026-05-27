using Microsoft.EntityFrameworkCore;
using OPT.Application.Interfaces;
using OPT.Domain.Entities;

namespace OPT.Infrastructure.Persistence.Repositories;

public class FormaPagoRepository(OPTDbContext context) : IFormaPagoRepository
{
    public async Task<IReadOnlyList<FormaPago>> GetAllAsync(CancellationToken ct = default)
        => await context.FormasPago.OrderBy(f => f.FormaPagoId).ToListAsync(ct);
}
