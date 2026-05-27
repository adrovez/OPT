using AtencionEntity = OPT.Domain.Entities.Atencion;

namespace OPT.Application.Atencion.DTOs;

public record AtencionDto(
    Guid AtencionId,
    Guid SucursalId,
    string SucursalNombre,
    Guid? AgendaId,
    Guid ClienteId,
    string ClienteNombre,
    Guid UsuarioAtencionId,
    string UsuarioAtencionNombre,
    Guid? AnamnesisId,
    Guid? RecetaCristalesId,
    DateTime FechaHoraAtencion,
    string Motivo,
    string? Observaciones,
    string Estado,
    DateTime CreatedAt,
    DateTime? UpdatedAt,
    CobroServicioDto? CobroServicio);

internal static class AtencionMappingExtensions
{
    internal static AtencionDto ToDto(this AtencionEntity a) => new(
        AtencionId:             a.AtencionId,
        SucursalId:             a.SucursalId,
        SucursalNombre:         a.Sucursal?.Nombre ?? string.Empty,
        AgendaId:               a.AgendaId,
        ClienteId:              a.ClienteId,
        ClienteNombre:          a.Cliente?.Nombre ?? string.Empty,
        UsuarioAtencionId:      a.UsuarioAtencionId,
        UsuarioAtencionNombre:  a.UsuarioAtencion?.Nombre ?? string.Empty,
        AnamnesisId:            a.AnamnesisId,
        RecetaCristalesId:      a.RecetaCristalesId,
        FechaHoraAtencion:      a.FechaHoraAtencion,
        Motivo:                 a.Motivo,
        Observaciones:          a.Observaciones,
        Estado:                 a.Estado,
        CreatedAt:              a.CreatedAt,
        UpdatedAt:              a.UpdatedAt,
        CobroServicio:          a.CobroServicio?.ToDto());
}
