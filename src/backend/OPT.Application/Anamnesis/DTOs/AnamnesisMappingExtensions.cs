using AnamnesisEntity = OPT.Domain.Entities.Anamnesis;

namespace OPT.Application.Anamnesis.DTOs;

/// <summary>Extensiones para mapear entre entidad Anamnesis y AnamnesisDto.</summary>
public static class AnamnesisMappingExtensions
{
    public static AnamnesisDto ToDto(this AnamnesisEntity a) => new(
        AnamnesisId: a.AnamnesisId,
        TenantId: a.TenantId,
        ClienteId: a.ClienteId,
        Hipertension: a.Hipertension,
        Diabetes: a.Diabetes,
        Alergias: a.Alergias,
        UsaLentes: a.UsaLentes,
        Observacion: a.Observacion,
        FechaRegistro: a.FechaRegistro,
        CreatedAt: a.CreatedAt,
        UpdatedAt: a.UpdatedAt,
        CreatedBy: a.CreatedBy,
        UpdatedBy: a.UpdatedBy);
}
