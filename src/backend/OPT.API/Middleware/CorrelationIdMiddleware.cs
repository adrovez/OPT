namespace OPT.API.Middleware;

/// <summary>
/// Middleware de Correlation ID para trazabilidad de requests.
///
/// Comportamiento:
/// - Si el request llega con el header <c>X-Correlation-Id</c>, lo reutiliza.
/// - Si no, genera un nuevo GUID.
/// - Inyecta el ID en el header de la respuesta y en el scope del logger,
///   de modo que todos los logs de ese request incluyan el mismo CorrelationId.
///
/// Esencial en SaaS multi-tenant para correlacionar logs de distintas capas
/// (API → Application → Infrastructure) ante un error en producción.
/// </summary>
public class CorrelationIdMiddleware(
    RequestDelegate next,
    ILogger<CorrelationIdMiddleware> logger)
{
    private const string CorrelationIdHeader = "X-Correlation-Id";

    public async Task InvokeAsync(HttpContext context)
    {
        // Reutiliza el ID del cliente si lo envía, o genera uno nuevo
        var correlationId = context.Request.Headers[CorrelationIdHeader].FirstOrDefault()
                            ?? Guid.NewGuid().ToString("N");

        // Expone el ID en la respuesta para que el cliente pueda correlacionar
        context.Response.Headers[CorrelationIdHeader] = correlationId;

        // Almacena en Items para que otros middleware/controladores puedan accederlo
        context.Items[CorrelationIdHeader] = correlationId;

        // Añade el CorrelationId a todos los logs del request actual
        using var scope = logger.BeginScope(
            new Dictionary<string, object>
            {
                ["CorrelationId"] = correlationId,
                ["RequestPath"]   = context.Request.Path.ToString()
            });

        await next(context);
    }
}

/// <summary>Extensión para registrar CorrelationIdMiddleware en el pipeline.</summary>
public static class CorrelationIdMiddlewareExtensions
{
    /// <summary>
    /// Registra el middleware de Correlation ID. Debe ser el PRIMERO en el pipeline
    /// para que todos los logs del request incluyan el ID.
    /// </summary>
    public static IApplicationBuilder UseCorrelationId(this IApplicationBuilder app)
        => app.UseMiddleware<CorrelationIdMiddleware>();
}
