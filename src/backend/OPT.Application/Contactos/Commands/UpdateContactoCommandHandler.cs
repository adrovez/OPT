using MediatR;
using OPT.Application.Interfaces;

namespace OPT.Application.Contactos.Commands;

public class UpdateContactoCommandHandler(IContactoRepository contactoRepository)
    : IRequestHandler<UpdateContactoCommand, Unit>
{
    public async Task<Unit> Handle(
        UpdateContactoCommand request, CancellationToken cancellationToken)
    {
        var contacto = await contactoRepository.GetByIdAsync(
            request.ContactoId, request.TenantId, cancellationToken)
            ?? throw new KeyNotFoundException(
                $"Contacto {request.ContactoId} no encontrado en este tenant.");

        contacto.Nombre = request.Nombre;
        contacto.Email = request.Email;
        contacto.Telefono = request.Telefono;
        contacto.Cargo = request.Cargo;
        contacto.Activo = request.Activo;
        contacto.UpdatedAt = DateTime.UtcNow;
        contacto.UpdatedBy = request.UpdatedBy;

        await contactoRepository.UpdateAsync(contacto, cancellationToken);
        return Unit.Value;
    }
}
