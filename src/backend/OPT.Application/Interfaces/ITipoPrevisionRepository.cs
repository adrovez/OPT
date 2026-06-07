using OPT.Application.Prevision.DTOs;

namespace OPT.Application.Interfaces;

/// <summary>Contrato de solo lectura para el catálogo de Tipos de Previsión.</summary>
public interface ITipoPrevisionRepository
{
    Task<IReadOnlyList<TipoPrevisionDto>> GetAllAsync(CancellationToken ct = default);
}
