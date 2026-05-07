using MediatR;
using OPT.Application.Contactos.DTOs;
using OPT.Application.Interfaces;

namespace OPT.Application.Contactos.Queries;

public class GetContactoByIdQueryHandler(IContactoRepository contactoRepository)
    : IRequestHandler<GetContactoByIdQuery, ContactoDto?>
{
    public async Task<ContactoDto?> Handle(
        GetContactoByIdQuery request, CancellationToken cancellationToken)
    {
        var contacto = await contactoRepository.GetByIdAsync(
            request.ContactoId, request.TenantId, cancellationToken);

        return contacto?.ToDto();
    }
}
