using FluentValidation;
using Microsoft.Extensions.DependencyInjection;

namespace OPT.Application;

/// <summary>Registra los servicios de la capa Application (MediatR + validadores).</summary>
public static class DependencyInjection
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        services.AddMediatR(cfg =>
            cfg.RegisterServicesFromAssembly(typeof(DependencyInjection).Assembly));

        services.AddValidatorsFromAssembly(typeof(DependencyInjection).Assembly);

        return services;
    }
}
