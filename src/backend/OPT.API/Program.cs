using FluentValidation.AspNetCore;
using OPT.Application;
using OPT.Infrastructure;
using OPT.API.Middleware;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddApplication();
builder.Services.AddInfrastructure(builder.Configuration);

builder.Services.AddFluentValidationAutoValidation();

// CORS: permite llamadas desde el frontend Angular en desarrollo
builder.Services.AddCors(options =>
{
    options.AddPolicy("FrontendDev", policy =>
        policy.WithOrigins("http://localhost:4200")
              .AllowAnyHeader()
              .AllowAnyMethod());
});

var app = builder.Build();

// ── Pipeline de Middleware (orden importa) ──────────────────────────────────
//
//  1. CorrelationId     → primero, para que todos los logs del request lleven el ID
//  2. ExceptionHandling → envuelve todo; convierte excepciones en ProblemDetails JSON
//  3. Swagger           → solo en desarrollo
//  4. CORS              → antes de Authentication
//  5. HttpsRedirection
//  6. Authentication    → verifica y parsea el JWT
//  7. Authorization     → aplica políticas de roles
//  8. TenantValidation  → segunda línea multi-tenant; valida claim tenant_id > 0
//  9. MapControllers    → despacha al controller
// ────────────────────────────────────────────────────────────────────────────

app.UseCorrelationId();
app.UseExceptionHandling();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("FrontendDev");
app.UseHttpsRedirection();
app.UseAuthentication();
app.UseAuthorization();
app.UseTenantValidation();

app.MapControllers();

app.Run();
