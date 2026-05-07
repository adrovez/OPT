using MediatR;
using OPT.Application.Interfaces;
using OPT.Domain.Entities;

namespace OPT.Application.Clientes.Commands;

public class CreateClienteCommandHandler(
    IClienteRepository clienteRepository,
    IContactoRepository contactoRepository)
    : IRequestHandler<CreateClienteCommand, int>
{
    public async Task<int> Handle(
        CreateClienteCommand request, CancellationToken cancellationToken)
    {
        var existe = await clienteRepository.ExisteDocumentoAsync(
            request.NumeroDocumento, request.TenantId, cancellationToken: cancellationToken);

        if (existe)
            throw new InvalidOperationException(
                $"Ya existe un cliente con el documento '{request.NumeroDocumento}' en este tenant.");

        var cliente = new Cliente
        {
            TenantId = request.TenantId,
            TipoCliente = request.TipoCliente,
            NumeroDocumento = request.NumeroDocumento,
            Nombre = request.Nombre,
            Direccion = request.Direccion,
            IdComuna = request.IdComuna,
            Celular = request.Celular,
            Mail = request.Mail,
            FechaNacimiento = request.FechaNacimiento,
            TipoPrevision = request.TipoPrevision,
            Giro = request.Giro,
            CreatedBy = request.CreatedBy,
            FechaIngreso = DateTime.UtcNow,
            CreatedAt = DateTime.UtcNow
        };

        var created = await clienteRepository.AddAsync(cliente, cancellationToken);

        // Crear contactos si se proporcionaron (solo aplica para Empresa)
        if (request.Contactos is { Count: > 0 })
        {
            var contactos = request.Contactos.Select(c => new Contacto
            {
                TenantId = request.TenantId,
                ClienteId = created.ClienteId,
                Nombre = c.Nombre,
                Cargo = c.Cargo,
                Email = c.Email,
                Telefono = c.Telefono,
                Activo = true,
                CreatedBy = request.CreatedBy,
                CreatedAt = DateTime.UtcNow
            });

            await contactoRepository.AddRangeAsync(contactos, cancellationToken);
        }

        return created.ClienteId;
    }
}
