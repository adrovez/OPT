using MediatR;
using OPT.Application.Interfaces;
using AnamnesisEntity = OPT.Domain.Entities.Anamnesis;

namespace OPT.Application.Anamnesis.Commands;

public class CreateAnamnesisCommandHandler(IAnamnesisRepository repository)
    : IRequestHandler<CreateAnamnesisCommand, Guid>
{
    public async Task<Guid> Handle(
        CreateAnamnesisCommand request, CancellationToken cancellationToken)
    {
        var anamnesis = new AnamnesisEntity
        {
            AnamnesisId = Guid.NewGuid(),
            TenantId = request.TenantId,
            ClienteId = request.ClienteId,
            Hipertension = request.Hipertension,
            Diabetes = request.Diabetes,
            Alergias = request.Alergias,
            UsaLentes = request.UsaLentes,
            Observacion = request.Observacion?.Trim(),
            FechaRegistro = DateTime.UtcNow,
            CreatedAt = DateTime.UtcNow,
            CreatedBy = request.CreatedBy
        };

        var created = await repository.AddAsync(anamnesis, cancellationToken);

        return created.AnamnesisId;
    }
}