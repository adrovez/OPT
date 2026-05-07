using MediatR;
using OPT.Application.Contactos.DTOs;
using OPT.Application.Interfaces;

namespace OPT.Application.Contactos.Queries;

public class GetContactosByClienteQueryHandler(IContactoRepository contactoRepository)
    : IRequestHandler<GetContactosByClienteQuery, IReadOnlyList<ContactoDto>>
{
    public async Task<IReadOnlyList<ContactoDto>> Handle(
        GetContactosByClienteQuery request, CancellationToken cancellationToken)
    {
        var contactos = await contactoRepository.GetByClienteAsync(
            request.ClienteId, request.TenantId, cancellationToken);

        return contactos.Select(c => c.ToDto()).ToList();
    }
}
