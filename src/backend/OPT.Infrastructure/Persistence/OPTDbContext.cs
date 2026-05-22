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
    public DbSet<UsuarioSucursal> UsuarioSucursales => Set<UsuarioSucursal>();
    public DbSet<Region> Regiones => Set<Region>();
    public DbSet<Comuna> Comunas => Set<Comuna>();
    public DbSet<Contacto> Contactos => Set<Contacto>();
    public DbSet<Anamnesis> Anamnesis => Set<Anamnesis>();
    public DbSet<RecetaCristales> RecetasCristales => Set<RecetaCristales>();
    public DbSet<Sucursal> Sucursales => Set<Sucursal>();
    public DbSet<Rol> Roles => Set<Rol>();
    public DbSet<Agenda> Agendas => Set<Agenda>();
    public DbSet<ProductoCategoria> ProductoCategorias => Set<ProductoCategoria>();
    public DbSet<Producto> Productos => Set<Producto>();
    public DbSet<ProductoVariante> ProductoVariantes => Set<ProductoVariante>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // ── Cliente ────────────────────────────────────────────────────────
        modelBuilder.Entity<Cliente>(e =>
        {
            e.ToTable("OPT_Cliente");
            e.HasKey(c => c.ClienteId);

            e.Property(c => c.ClienteId)
             .HasDefaultValueSql("NEWSEQUENTIALID()");
            e.Property(c => c.TenantId)
             .IsRequired();

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

            e.Property(u => u.UsuarioId)
             .HasDefaultValueSql("NEWSEQUENTIALID()");
            e.Property(u => u.TenantId)
             .IsRequired();

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

        // ── Region ─────────────────────────────────────────────────────────
        modelBuilder.Entity<Region>(e =>
        {
            e.ToTable("OPT_Region");
            e.HasKey(r => r.IdRegion);

            e.Property(r => r.Nombre)
                .HasColumnName("Region")
                .HasMaxLength(100)
                .IsRequired();
            e.Property(r => r.Codigo).HasMaxLength(10);
            e.Property(r => r.CreatedBy).HasMaxLength(100);
            e.Property(r => r.UpdatedBy).HasMaxLength(100);

            e.HasIndex(r => r.Codigo)
             .HasFilter("[IsDeleted] = 0")
             .IsUnique();

            // Filtro global: excluye eliminados lógicamente
            e.HasQueryFilter(r => !r.IsDeleted);
        });

        // ── Comuna ─────────────────────────────────────────────────────────
        modelBuilder.Entity<Comuna>(e =>
        {
            e.ToTable("OPT_Comuna");
            e.HasKey(c => c.IdComuna);

            e.Property(c => c.Nombre)
                .HasColumnName("Comuna")
                .HasMaxLength(100)
                .IsRequired();
            e.Property(c => c.Codigo).HasMaxLength(10);
            e.Property(c => c.CreatedBy).HasMaxLength(100);
            e.Property(c => c.UpdatedBy).HasMaxLength(100);

            e.HasIndex(c => c.IdRegion);
            e.HasIndex(c => c.Codigo)
             .HasFilter("[IsDeleted] = 0")
             .IsUnique();

            e.HasOne(c => c.Region)
             .WithMany(r => r.Comunas)
             .HasForeignKey(c => c.IdRegion)
             .OnDelete(DeleteBehavior.Restrict);

            // Filtro global: excluye eliminados lógicamente
            e.HasQueryFilter(c => !c.IsDeleted);
        });

        // ── Contacto ───────────────────────────────────────────────────────
        modelBuilder.Entity<Contacto>(e =>
        {
            e.ToTable("OPT_Contacto");
            e.HasKey(c => c.ContactoId);

            e.Property(c => c.ContactoId)
             .HasDefaultValueSql("NEWSEQUENTIALID()");
            e.Property(c => c.TenantId)
             .IsRequired();

            e.Property(c => c.Nombre).HasMaxLength(150).IsRequired();
            e.Property(c => c.Email).HasMaxLength(150);
            e.Property(c => c.Telefono).HasMaxLength(50);
            e.Property(c => c.Cargo).HasMaxLength(100);
            e.Property(c => c.CreatedBy).HasMaxLength(100);
            e.Property(c => c.UpdatedBy).HasMaxLength(100);

            e.HasIndex(c => c.TenantId);
            e.HasIndex(c => c.ClienteId);

            e.HasOne(c => c.Cliente)
             .WithMany(cl => cl.Contactos)
             .HasForeignKey(c => c.ClienteId)
             .OnDelete(DeleteBehavior.Cascade);

            // Filtro global: excluye eliminados lógicamente
            e.HasQueryFilter(c => !c.IsDeleted);
        });

        // ── Anamnesis ──────────────────────────────────────────────────────
        modelBuilder.Entity<Anamnesis>(e =>
        {
            e.ToTable("OPT_Anamnesis");
            e.HasKey(a => a.AnamnesisId);

            e.Property(a => a.AnamnesisId)
             .HasDefaultValueSql("NEWSEQUENTIALID()");
            e.Property(a => a.TenantId)
             .IsRequired();

            e.Property(a => a.Observacion).HasMaxLength(1000);
            e.Property(a => a.CreatedBy).HasMaxLength(100);
            e.Property(a => a.UpdatedBy).HasMaxLength(100);

            e.HasIndex(a => new { a.TenantId, a.ClienteId })
             .HasFilter("[IsDeleted] = 0");

            e.HasOne(a => a.Cliente)
             .WithMany()
             .HasForeignKey(a => a.ClienteId)
             .OnDelete(DeleteBehavior.Restrict);

            // Filtro global: excluye eliminados lógicamente
            e.HasQueryFilter(a => !a.IsDeleted);
        });

        // ── RecetaCristales ────────────────────────────────────────────────
        modelBuilder.Entity<RecetaCristales>(e =>
        {
            e.ToTable("OPT_RecetaCristales");
            e.HasKey(r => r.RecetaCristalesId);

            e.Property(r => r.RecetaCristalesId)
             .HasDefaultValueSql("NEWSEQUENTIALID()");
            e.Property(r => r.TenantId)
             .IsRequired();

            e.Property(r => r.LejosODEsferico).HasMaxLength(10);
            e.Property(r => r.LejosODCilindro).HasMaxLength(10);
            e.Property(r => r.LejosODEje).HasMaxLength(10);
            e.Property(r => r.LejosODObservacion).HasMaxLength(200);

            e.Property(r => r.LejosOIEsferico).HasMaxLength(10);
            e.Property(r => r.LejosOICilindro).HasMaxLength(10);
            e.Property(r => r.LejosOIEje).HasMaxLength(10);
            e.Property(r => r.LejosOIObservacion).HasMaxLength(200);

            e.Property(r => r.LejosDPEsferico).HasMaxLength(10);
            e.Property(r => r.LejosDPObservacion).HasMaxLength(200);

            e.Property(r => r.CercaODEsferico).HasMaxLength(10);
            e.Property(r => r.CercaODCilindro).HasMaxLength(10);
            e.Property(r => r.CercaODEje).HasMaxLength(10);
            e.Property(r => r.CercaODObservacion).HasMaxLength(200);

            e.Property(r => r.CercaOIEsferico).HasMaxLength(10);
            e.Property(r => r.CercaOICilindro).HasMaxLength(10);
            e.Property(r => r.CercaOIEje).HasMaxLength(10);
            e.Property(r => r.CercaOIObservacion).HasMaxLength(200);

            e.Property(r => r.CercaDPEsferico).HasMaxLength(10);
            e.Property(r => r.CercaDPObservacion).HasMaxLength(200);

            e.Property(r => r.LejosADDEsfera).HasMaxLength(10);

            e.Property(r => r.CreatedBy).HasMaxLength(100);
            e.Property(r => r.UpdatedBy).HasMaxLength(100);

            e.HasIndex(r => new { r.TenantId, r.ClienteId })
             .HasFilter("[IsDeleted] = 0");

            e.HasOne(r => r.Cliente)
             .WithMany()
             .HasForeignKey(r => r.ClienteId)
             .OnDelete(DeleteBehavior.Restrict);

            // Filtro global: excluye eliminados lógicamente
            e.HasQueryFilter(r => !r.IsDeleted);
        });

        // ── UsuarioSucursal ────────────────────────────────────────────────
        modelBuilder.Entity<UsuarioSucursal>(e =>
        {
            e.ToTable("OPT_UsuarioSucursal");
            e.HasKey(us => new { us.UsuarioId, us.SucursalId });

            e.Property(us => us.AssignedBy).HasMaxLength(100);

            e.HasOne(us => us.Usuario)
             .WithMany(u => u.UsuarioSucursales)
             .HasForeignKey(us => us.UsuarioId)
             .OnDelete(DeleteBehavior.Cascade);

            e.HasOne(us => us.Sucursal)
             .WithMany()
             .HasForeignKey(us => us.SucursalId)
             .OnDelete(DeleteBehavior.Restrict);
        });

        // ── Rol ────────────────────────────────────────────────────────────
        modelBuilder.Entity<Rol>(e =>
        {
            e.ToTable("OPT_Rol");
            e.HasKey(r => r.RolId);
            e.Property(r => r.Nombre).HasMaxLength(50).IsRequired();
        });

        // ── Agenda ─────────────────────────────────────────────────────────
        modelBuilder.Entity<Agenda>(e =>
        {
            e.ToTable("OPT_Agenda");
            e.HasKey(a => a.AgendaId);

            e.Property(a => a.AgendaId).HasDefaultValueSql("NEWSEQUENTIALID()");
            e.Property(a => a.Motivo).HasMaxLength(200).IsRequired();
            e.Property(a => a.Estado).HasMaxLength(20).IsRequired().HasDefaultValue("Pendiente");
            e.Property(a => a.Observaciones).HasMaxLength(500);
            e.Property(a => a.CreatedBy).HasMaxLength(100);
            e.Property(a => a.UpdatedBy).HasMaxLength(100);

            e.HasIndex(a => new { a.TenantId, a.SucursalId, a.FechaHora })
             .HasFilter("[IsDeleted] = 0");

            e.HasIndex(a => a.ClienteId)
             .HasFilter("[IsDeleted] = 0");

            e.HasOne(a => a.Sucursal)
             .WithMany()
             .HasForeignKey(a => a.SucursalId)
             .OnDelete(DeleteBehavior.Restrict);

            e.HasOne(a => a.Cliente)
             .WithMany()
             .HasForeignKey(a => a.ClienteId)
             .OnDelete(DeleteBehavior.Restrict);

            e.HasOne(a => a.Usuario)
             .WithMany()
             .HasForeignKey(a => a.UsuarioId)
             .OnDelete(DeleteBehavior.SetNull);

            e.HasQueryFilter(a => !a.IsDeleted);
        });

        // ── ProductoCategoria ──────────────────────────────────────────────
        modelBuilder.Entity<ProductoCategoria>(e =>
        {
            e.ToTable("OPT_ProductoCategoria");
            e.HasKey(c => c.CategoriaId);

            e.Property(c => c.CategoriaId).HasDefaultValueSql("NEWSEQUENTIALID()");
            e.Property(c => c.TenantId).IsRequired();
            e.Property(c => c.Nombre).HasMaxLength(100).IsRequired();
            e.Property(c => c.CreatedBy).HasMaxLength(100);
            e.Property(c => c.UpdatedBy).HasMaxLength(100);

            e.HasIndex(c => c.TenantId).HasFilter("[IsDeleted] = 0");

            e.HasQueryFilter(c => !c.IsDeleted);
        });

        // ── Producto ───────────────────────────────────────────────────────
        modelBuilder.Entity<Producto>(e =>
        {
            e.ToTable("OPT_Producto");
            e.HasKey(p => p.ProductoId);

            e.Property(p => p.ProductoId).HasDefaultValueSql("NEWSEQUENTIALID()");
            e.Property(p => p.TenantId).IsRequired();
            e.Property(p => p.Nombre).HasMaxLength(200).IsRequired();
            e.Property(p => p.Descripcion).HasMaxLength(1000);
            e.Property(p => p.TipoProducto).HasMaxLength(20).IsRequired();
            e.Property(p => p.CodigoInterno).HasMaxLength(50);
            e.Property(p => p.CreatedBy).HasMaxLength(100);
            e.Property(p => p.UpdatedBy).HasMaxLength(100);

            e.HasIndex(p => new { p.TenantId, p.CodigoInterno })
             .HasFilter("[IsDeleted] = 0 AND [CodigoInterno] IS NOT NULL")
             .IsUnique();

            e.HasOne(p => p.Categoria)
             .WithMany(c => c.Productos)
             .HasForeignKey(p => p.CategoriaId)
             .OnDelete(DeleteBehavior.Restrict);

            e.HasQueryFilter(p => !p.IsDeleted);
        });

        // ── ProductoVariante ───────────────────────────────────────────────
        modelBuilder.Entity<ProductoVariante>(e =>
        {
            e.ToTable("OPT_ProductoVariante");
            e.HasKey(v => v.VarianteId);

            e.Property(v => v.VarianteId).HasDefaultValueSql("NEWSEQUENTIALID()");
            e.Property(v => v.TenantId).IsRequired();
            e.Property(v => v.Nombre).HasMaxLength(200).IsRequired();
            e.Property(v => v.CodigoBarras).HasMaxLength(50);
            e.Property(v => v.CreatedBy).HasMaxLength(100);
            e.Property(v => v.UpdatedBy).HasMaxLength(100);

            e.HasIndex(v => new { v.TenantId, v.CodigoBarras })
             .HasFilter("[IsDeleted] = 0 AND [CodigoBarras] IS NOT NULL")
             .IsUnique();

            e.HasOne(v => v.Producto)
             .WithMany(p => p.Variantes)
             .HasForeignKey(v => v.ProductoId)
             .OnDelete(DeleteBehavior.Cascade);

            e.HasQueryFilter(v => !v.IsDeleted);
        });

        // ── Sucursal ───────────────────────────────────────────────────────
        modelBuilder.Entity<Sucursal>(e =>
        {
            e.ToTable("OPT_Sucursal");
            e.HasKey(s => s.SucursalId);

            e.Property(s => s.SucursalId)
             .HasColumnName("idSucursal")
             .HasDefaultValueSql("NEWSEQUENTIALID()");
            e.Property(s => s.TenantId)
             .IsRequired();

            e.Property(s => s.Nombre).HasMaxLength(150).IsRequired();
            e.Property(s => s.Direccion).HasMaxLength(250);
            e.Property(s => s.Telefono).HasMaxLength(50);
            e.Property(s => s.CreatedBy).HasMaxLength(100);
            e.Property(s => s.UpdatedBy).HasMaxLength(100);

            e.HasIndex(s => s.TenantId)
             .HasFilter("[IsDeleted] = 0");

            // Filtro global: excluye eliminados lógicamente
            e.HasQueryFilter(s => !s.IsDeleted);
        });
    }
}
