using MediatR;
using OPT.Application.Interfaces;
using OPT.Application.Usuarios.DTOs;

namespace OPT.Application.Usuarios.Queries;

public record GetUsuarioByIdQuery(Guid UsuarioId, Guid TenantId) : IRequest<UsuarioDto?>;

public class GetUsuarioByIdQueryHandler(IUsuarioRepository repository)
    : IRequestHandler<GetUsuarioByIdQuery, UsuarioDto?>
{
    public async Task<UsuarioDto?> Handle(GetUsuarioByIdQuery query, CancellationToken ct)
    {
        var usuario = await repository.GetByIdAsync(query.UsuarioId, query.TenantId, ct);
        return usuario?.ToDto();
    }
}
