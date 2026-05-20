using MediatR;
using OPT.Application.Interfaces;
using OPT.Application.Usuarios.DTOs;

namespace OPT.Application.Usuarios.Queries;

public record GetUsuariosQuery(Guid TenantId) : IRequest<IReadOnlyList<UsuarioDto>>;

public class GetUsuariosQueryHandler(IUsuarioRepository repository)
    : IRequestHandler<GetUsuariosQuery, IReadOnlyList<UsuarioDto>>
{
    public async Task<IReadOnlyList<UsuarioDto>> Handle(GetUsuariosQuery query, CancellationToken ct)
    {
        var usuarios = await repository.GetAllAsync(query.TenantId, ct);
        return usuarios.Select(u => u.ToDto()).ToList();
    }
}
