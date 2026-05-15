using MediatR;
using OPT.Application.Contactos.DTOs;

namespace OPT.Application.Contactos.Queries;

/// <summary>Query para obtener el detalle de un contacto por ID.</summary>
public record GetContactoByIdQuery(
    Guid ContactoId,
    Guid TenantId) : IRequest<ContactoDto?>;
