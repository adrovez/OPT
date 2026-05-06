using Microsoft.EntityFrameworkCore;
using OPT.Domain.Entities;

namespace OPT.Infrastructure.Persistence;

/// <summary>
/// DbContext principal de OPT. Mapea las entidades a las tablas SQL Server
/// siguiendo los scripts versionados en database/sql/.
/// </summary>
public class OPTDbContext(DbContextOptions<OPTDbContext> options) : DbContext(options)
{
    public DbSet<Cliente> Clientes => Set<Cliente>();
    public DbSet<Usuario> Usuarios => Set<Usuario>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // ── Cliente ────────────────────────────────────────────────────────
        modelBuilder.Entity<Cliente>(e =>
        {
            e.ToTable("OPT_Cliente");
            e.HasKey(c => c.ClienteId);

            e.Property(c => c.TipoCliente).HasMaxLength(20).IsRequired();
            e.Property(c => c.NumeroDocumento).HasMaxLength(20).IsRequired();
            e.Property(c => c.Nombre).HasMaxLength(200).IsRequired();
            e.Property(c => c.Direccion).HasMaxLength(250);
            e.Property(c => c.Celular).HasMaxLength(50);
            e.Property(c => c.Mail).HasMaxLength(150);
            e.Property(c => c.TipoPrevision).HasMaxLength(50);
            e.Property(c => c.Giro).HasMaxLength(150);
            e.Property(c => c.CreatedBy).HasMaxLength(100);
            e.Property(c => c.UpdatedBy).HasMaxLength(100);

            // Índice compuesto TenantId+NumeroDocumento (único por documentos activos)
            e.HasIndex(c => new { c.TenantId, c.NumeroDocumento })
             .HasFilter("[IsDeleted] = 0")
             .IsUnique();

            // Filtro global: excluye eliminados lógicamente
            e.HasQueryFilter(c => !c.IsDeleted);
        });

        // ── Usuario ────────────────────────────────────────────────────────
        modelBuilder.Entity<Usuario>(e =>
        {
            e.ToTable("OPT_Usuario");
            e.HasKey(u => u.UsuarioId);

            e.Property(u => u.RutUsuario).HasMaxLength(20).IsRequired();
            e.Property(u => u.Nombre).HasMaxLength(150).IsRequired();
            e.Property(u => u.Email).HasMaxLength(150).IsRequired();
            e.Property(u => u.PasswordHash).HasMaxLength(256).IsRequired();
            e.Property(u => u.Rol).HasMaxLength(50).IsRequired().HasDefaultValue("Operador");
            e.Property(u => u.CreatedBy).HasMaxLength(100);
            e.Property(u => u.UpdatedBy).HasMaxLength(100);

            e.HasIndex(u => new { u.TenantId, u.RutUsuario })
             .HasFilter("[IsDeleted] = 0")
             .IsUnique();

            // Filtro global: excluye eliminados lógicamente
            e.HasQueryFilter(u => !u.IsDeleted);
        });
    }
}
