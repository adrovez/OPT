using AgendaEntity = OPT.Domain.Entities.Agenda;

namespace OPT.Application.Agenda.DTOs;

public record AgendaDto(
    Guid AgendaId,
    Guid SucursalId,
    string SucursalNombre,
    Guid ClienteId,
    string ClienteNombre,
    Guid? UsuarioId,
    string? UsuarioNombre,
    DateTime FechaHora,
    short DuracionMinutos,
    string Motivo,
    string Estado,
    string? Observaciones,
    DateTime CreatedAt,
    DateTime? UpdatedAt);

internal static class AgendaMappingExtensions
{
    internal static AgendaDto ToDto(this AgendaEntity a) => new(
        AgendaId:       a.AgendaId,
        SucursalId:     a.SucursalId,
        SucursalNombre: a.Sucursal?.Nombre ?? string.Empty,
        ClienteId:      a.ClienteId,
        ClienteNombre:  a.Cliente?.Nombre ?? string.Empty,
        UsuarioId:      a.UsuarioId,
        UsuarioNombre:  a.Usuario?.Nombre,
        FechaHora:      a.FechaHora,
        DuracionMinutos: a.DuracionMinutos,
        Motivo:         a.Motivo,
        Estado:         a.Estado,
        Observaciones:  a.Observaciones,
        CreatedAt:      a.CreatedAt,
        UpdatedAt:      a.UpdatedAt);
}
