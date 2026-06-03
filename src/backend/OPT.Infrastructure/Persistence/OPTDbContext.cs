using Microsoft.EntityFrameworkCore;
using OPT.Domain.Entities;

namespace OPT.Infrastructure.Persistence;

/// <summary>
/// DbContext principal de OPT. Mapea las entidades a las tablas SQL Server
/// siguiendo los scripts versionados en database/sql/.
/// </summary>
public class OPTDbContext(DbContextOptions<OPTDbContext> options) : DbContext(options)
{
    // ── Catálogos ──────────────────────────────────────────────────────────
    public DbSet<Region> Regiones => Set<Region>();
    public DbSet<Comuna> Comunas => Set<Comuna>();
    public DbSet<Rol> Roles => Set<Rol>();
    public DbSet<FormaPago> FormasPago => Set<FormaPago>();

    // ── Tenant entities ────────────────────────────────────────────────────
    public DbSet<Cliente> Clientes => Set<Cliente>();
    public DbSet<Sucursal> Sucursales => Set<Sucursal>();
    public DbSet<Usuario> Usuarios => Set<Usuario>();
    public DbSet<UsuarioSucursal> UsuarioSucursales => Set<UsuarioSucursal>();
    public DbSet<Contacto> Contactos => Set<Contacto>();
    public DbSet<Anamnesis> Anamnesis => Set<Anamnesis>();
    public DbSet<RecetaCristales> RecetasCristales => Set<RecetaCristales>();
    public DbSet<Agenda> Agendas => Set<Agenda>();
    public DbSet<Atencion> Atenciones => Set<Atencion>();
    public DbSet<CobroServicio> CobrosServicio => Set<CobroServicio>();

    // ── Inventario (nuevo esquema 027) ────────────────────────────────────
    public DbSet<Categoria> Categorias => Set<Categoria>();
    public DbSet<Producto> Productos => Set<Producto>();
    public DbSet<PrecioProducto> PreciosProducto => Set<PrecioProducto>();
    public DbSet<Stock> Stocks => Set<Stock>();
    public DbSet<MovimientoStock> MovimientosStock => Set<MovimientoStock>();
    public DbSet<DocumentoEntrada> DocumentosEntrada => Set<DocumentoEntrada>();
    public DbSet<DocumentoEntradaLinea> DocumentosEntradaLineas => Set<DocumentoEntradaLinea>();
    public DbSet<Transferencia> Transferencias => Set<Transferencia>();
    public DbSet<TransferenciaLinea> TransferenciasLineas => Set<TransferenciaLinea>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // ── Cliente ────────────────────────────────────────────────────────
        modelBuilder.Entity<Cliente>(e =>
        {
            e.ToTable("OPT_Cliente");
            e.HasKey(c => c.ClienteId);

            e.Property(c => c.ClienteId).HasDefaultValueSql("NEWSEQUENTIALID()");
            e.Property(c => c.TenantId).IsRequired();
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

            e.HasIndex(c => new { c.TenantId, c.NumeroDocumento })
             .HasFilter("[IsDeleted] = 0").IsUnique();

            e.HasQueryFilter(c => !c.IsDeleted);
        });

        // ── Usuario ────────────────────────────────────────────────────────
        modelBuilder.Entity<Usuario>(e =>
        {
            e.ToTable("OPT_Usuario");
            e.HasKey(u => u.UsuarioId);

            e.Property(u => u.UsuarioId).HasDefaultValueSql("NEWSEQUENTIALID()");
            e.Property(u => u.TenantId).IsRequired();
            e.Property(u => u.RutUsuario).HasMaxLength(20).IsRequired();
            e.Property(u => u.Nombre).HasMaxLength(150).IsRequired();
            e.Property(u => u.Email).HasMaxLength(150).IsRequired();
            e.Property(u => u.PasswordHash).HasMaxLength(256).IsRequired();
            e.Property(u => u.Rol).HasMaxLength(50).IsRequired().HasDefaultValue("Operador");
            e.Property(u => u.CreatedBy).HasMaxLength(100);
            e.Property(u => u.UpdatedBy).HasMaxLength(100);

            e.HasIndex(u => new { u.TenantId, u.RutUsuario })
             .HasFilter("[IsDeleted] = 0").IsUnique();

            e.HasQueryFilter(u => !u.IsDeleted);
        });

        // ── Region ─────────────────────────────────────────────────────────
        modelBuilder.Entity<Region>(e =>
        {
            e.ToTable("OPT_Region");
            e.HasKey(r => r.IdRegion);
            e.Property(r => r.Nombre).HasColumnName("Region").HasMaxLength(100).IsRequired();
            e.Property(r => r.Codigo).HasMaxLength(10);
            e.Property(r => r.CreatedBy).HasMaxLength(100);
            e.Property(r => r.UpdatedBy).HasMaxLength(100);
            e.HasIndex(r => r.Codigo).HasFilter("[IsDeleted] = 0").IsUnique();
            e.HasQueryFilter(r => !r.IsDeleted);
        });

        // ── Comuna ─────────────────────────────────────────────────────────
        modelBuilder.Entity<Comuna>(e =>
        {
            e.ToTable("OPT_Comuna");
            e.HasKey(c => c.IdComuna);
            e.Property(c => c.Nombre).HasColumnName("Comuna").HasMaxLength(100).IsRequired();
            e.Property(c => c.Codigo).HasMaxLength(10);
            e.Property(c => c.CreatedBy).HasMaxLength(100);
            e.Property(c => c.UpdatedBy).HasMaxLength(100);
            e.HasIndex(c => c.IdRegion);
            e.HasIndex(c => c.Codigo).HasFilter("[IsDeleted] = 0").IsUnique();
            e.HasOne(c => c.Region).WithMany(r => r.Comunas)
             .HasForeignKey(c => c.IdRegion).OnDelete(DeleteBehavior.Restrict);
            e.HasQueryFilter(c => !c.IsDeleted);
        });

        // ── Contacto ───────────────────────────────────────────────────────
        modelBuilder.Entity<Contacto>(e =>
        {
            e.ToTable("OPT_Contacto");
            e.HasKey(c => c.ContactoId);
            e.Property(c => c.ContactoId).HasDefaultValueSql("NEWSEQUENTIALID()");
            e.Property(c => c.TenantId).IsRequired();
            e.Property(c => c.Nombre).HasMaxLength(150).IsRequired();
            e.Property(c => c.Email).HasMaxLength(150);
            e.Property(c => c.Telefono).HasMaxLength(50);
            e.Property(c => c.Cargo).HasMaxLength(100);
            e.Property(c => c.CreatedBy).HasMaxLength(100);
            e.Property(c => c.UpdatedBy).HasMaxLength(100);
            e.HasIndex(c => c.TenantId);
            e.HasIndex(c => c.ClienteId);
            e.HasOne(c => c.Cliente).WithMany(cl => cl.Contactos)
             .HasForeignKey(c => c.ClienteId).OnDelete(DeleteBehavior.Cascade);
            e.HasQueryFilter(c => !c.IsDeleted);
        });

        // ── Anamnesis ──────────────────────────────────────────────────────
        modelBuilder.Entity<Anamnesis>(e =>
        {
            e.ToTable("OPT_Anamnesis");
            e.HasKey(a => a.AnamnesisId);
            e.Property(a => a.AnamnesisId).HasDefaultValueSql("NEWSEQUENTIALID()");
            e.Property(a => a.TenantId).IsRequired();
            e.Property(a => a.Observacion).HasMaxLength(1000);
            e.Property(a => a.CreatedBy).HasMaxLength(100);
            e.Property(a => a.UpdatedBy).HasMaxLength(100);
            e.HasIndex(a => new { a.TenantId, a.ClienteId }).HasFilter("[IsDeleted] = 0");
            e.HasOne(a => a.Cliente).WithMany()
             .HasForeignKey(a => a.ClienteId).OnDelete(DeleteBehavior.Restrict);
            e.HasOne(a => a.Atencion).WithMany()
             .HasForeignKey(a => a.AtencionId).OnDelete(DeleteBehavior.Restrict);
            e.HasQueryFilter(a => !a.IsDeleted);
        });

        // ── RecetaCristales ────────────────────────────────────────────────
        modelBuilder.Entity<RecetaCristales>(e =>
        {
            e.ToTable("OPT_RecetaCristales");
            e.HasKey(r => r.RecetaCristalesId);
            e.Property(r => r.RecetaCristalesId).HasDefaultValueSql("NEWSEQUENTIALID()");
            e.Property(r => r.TenantId).IsRequired();
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
            e.Property(r => r.Fuente).HasMaxLength(20).IsRequired().HasDefaultValue("Consulta");
            e.HasIndex(r => new { r.TenantId, r.ClienteId }).HasFilter("[IsDeleted] = 0");
            e.HasOne(r => r.Cliente).WithMany()
             .HasForeignKey(r => r.ClienteId).OnDelete(DeleteBehavior.Restrict);
            e.HasOne(r => r.Atencion).WithMany()
             .HasForeignKey(r => r.AtencionId).OnDelete(DeleteBehavior.Restrict);
            e.HasQueryFilter(r => !r.IsDeleted);
        });

        // ── UsuarioSucursal ────────────────────────────────────────────────
        modelBuilder.Entity<UsuarioSucursal>(e =>
        {
            e.ToTable("OPT_UsuarioSucursal");
            e.HasKey(us => new { us.UsuarioId, us.SucursalId });
            e.Property(us => us.AssignedBy).HasMaxLength(100);
            e.HasOne(us => us.Usuario).WithMany(u => u.UsuarioSucursales)
             .HasForeignKey(us => us.UsuarioId).OnDelete(DeleteBehavior.Cascade);
            e.HasOne(us => us.Sucursal).WithMany()
             .HasForeignKey(us => us.SucursalId).OnDelete(DeleteBehavior.Restrict);
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
            e.Property(a => a.SucursalId).HasColumnName("idSucursal");
            e.Property(a => a.Motivo).HasMaxLength(200).IsRequired();
            e.Property(a => a.Estado).HasMaxLength(20).IsRequired().HasDefaultValue("Pendiente");
            e.Property(a => a.Observaciones).HasMaxLength(500);
            e.Property(a => a.CreatedBy).HasMaxLength(100);
            e.Property(a => a.UpdatedBy).HasMaxLength(100);
            e.HasIndex(a => new { a.TenantId, a.SucursalId, a.FechaHora }).HasFilter("[IsDeleted] = 0");
            e.HasIndex(a => a.ClienteId).HasFilter("[IsDeleted] = 0");
            e.HasOne(a => a.Sucursal).WithMany()
             .HasForeignKey(a => a.SucursalId).OnDelete(DeleteBehavior.Restrict);
            e.HasOne(a => a.Cliente).WithMany()
             .HasForeignKey(a => a.ClienteId).OnDelete(DeleteBehavior.Restrict);
            e.HasOne(a => a.Usuario).WithMany()
             .HasForeignKey(a => a.UsuarioId).OnDelete(DeleteBehavior.SetNull);
            e.HasQueryFilter(a => !a.IsDeleted);
        });

        // ── Sucursal ───────────────────────────────────────────────────────
        modelBuilder.Entity<Sucursal>(e =>
        {
            e.ToTable("OPT_Sucursal");
            e.HasKey(s => s.SucursalId);
            e.Property(s => s.SucursalId).HasColumnName("idSucursal").HasDefaultValueSql("NEWSEQUENTIALID()");
            e.Property(s => s.TenantId).IsRequired();
            e.Property(s => s.Nombre).HasMaxLength(150).IsRequired();
            e.Property(s => s.Direccion).HasMaxLength(250);
            e.Property(s => s.Telefono).HasMaxLength(50);
            e.Property(s => s.CreatedBy).HasMaxLength(100);
            e.Property(s => s.UpdatedBy).HasMaxLength(100);
            e.HasIndex(s => s.TenantId).HasFilter("[IsDeleted] = 0");
            e.HasQueryFilter(s => !s.IsDeleted);
        });

        // ── FormaPago ──────────────────────────────────────────────────────
        modelBuilder.Entity<FormaPago>(e =>
        {
            e.ToTable("OPT_FormaPago");
            e.HasKey(f => f.FormaPagoId);
            e.Property(f => f.Descripcion).HasMaxLength(100).IsRequired();
        });

        // ── Atencion ───────────────────────────────────────────────────────
        modelBuilder.Entity<Atencion>(e =>
        {
            e.ToTable("OPT_Atencion");
            e.HasKey(a => a.AtencionId);
            e.Property(a => a.AtencionId).HasDefaultValueSql("NEWSEQUENTIALID()");
            e.Property(a => a.SucursalId).HasColumnName("idSucursal");
            e.Property(a => a.Motivo).HasMaxLength(300).IsRequired();
            e.Property(a => a.Observaciones).HasMaxLength(2000);
            e.Property(a => a.Estado).HasMaxLength(20).IsRequired().HasDefaultValue("Abierta");
            e.Property(a => a.CreatedBy).HasMaxLength(100);
            e.Property(a => a.UpdatedBy).HasMaxLength(100);
            e.HasIndex(a => new { a.TenantId, a.SucursalId, a.FechaHoraAtencion }).HasFilter("[IsDeleted] = 0");
            e.HasIndex(a => a.ClienteId).HasFilter("[IsDeleted] = 0");
            e.HasIndex(a => a.AgendaId).HasFilter("[IsDeleted] = 0 AND [AgendaId] IS NOT NULL");
            e.HasOne(a => a.Sucursal).WithMany()
             .HasForeignKey(a => a.SucursalId).OnDelete(DeleteBehavior.Restrict);
            e.HasOne(a => a.Cliente).WithMany()
             .HasForeignKey(a => a.ClienteId).OnDelete(DeleteBehavior.Restrict);
            e.HasOne(a => a.UsuarioAtencion).WithMany()
             .HasForeignKey(a => a.UsuarioAtencionId).OnDelete(DeleteBehavior.Restrict);
            e.HasOne(a => a.Agenda).WithMany()
             .HasForeignKey(a => a.AgendaId).OnDelete(DeleteBehavior.Restrict);
            e.HasOne(a => a.Anamnesis).WithMany()
             .HasForeignKey(a => a.AnamnesisId).OnDelete(DeleteBehavior.Restrict);
            e.HasOne(a => a.RecetaCristales).WithMany()
             .HasForeignKey(a => a.RecetaCristalesId).OnDelete(DeleteBehavior.Restrict);
            e.HasOne(a => a.CobroServicio).WithOne(c => c.Atencion)
             .HasForeignKey<CobroServicio>(c => c.AtencionId).OnDelete(DeleteBehavior.Restrict);
            e.HasQueryFilter(a => !a.IsDeleted);
        });

        // ── CobroServicio ──────────────────────────────────────────────────
        modelBuilder.Entity<CobroServicio>(e =>
        {
            e.ToTable("OPT_CobroServicio");
            e.HasKey(c => c.CobroServicioId);
            e.Property(c => c.CobroServicioId).HasDefaultValueSql("NEWSEQUENTIALID()");
            e.Property(c => c.SucursalId).HasColumnName("idSucursal");
            e.Property(c => c.Monto).HasColumnType("decimal(12,2)");
            e.Property(c => c.Observaciones).HasMaxLength(500);
            e.Property(c => c.CreatedBy).HasMaxLength(100);
            e.Property(c => c.UpdatedBy).HasMaxLength(100);
            e.HasOne(c => c.FormaPago).WithMany()
             .HasForeignKey(c => c.FormaPagoId).OnDelete(DeleteBehavior.Restrict);
            e.HasQueryFilter(c => !c.IsDeleted);
        });

        // ── Categoria ─────────────────────────────────────────────────────
        modelBuilder.Entity<Categoria>(e =>
        {
            e.ToTable("OPT_Categoria");
            e.HasKey(c => c.CategoriaId);
            e.Property(c => c.CategoriaId).HasDefaultValueSql("NEWSEQUENTIALID()");
            e.Property(c => c.TenantId).IsRequired();
            e.Property(c => c.Nombre).HasMaxLength(100).IsRequired();
            e.Property(c => c.Descripcion).HasMaxLength(500);
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
            e.Property(p => p.CodigoInterno).HasMaxLength(100).IsRequired();
            e.Property(p => p.Nombre).HasMaxLength(200).IsRequired();
            e.Property(p => p.Descripcion).HasMaxLength(2000);
            e.Property(p => p.Tipo).HasMaxLength(20).IsRequired().HasDefaultValue("Producto");
            e.Property(p => p.UnidadMedida).HasMaxLength(50);
            e.Property(p => p.CreatedBy).HasMaxLength(100);
            e.Property(p => p.UpdatedBy).HasMaxLength(100);

            e.HasIndex(p => new { p.TenantId, p.CodigoInterno })
             .HasFilter("[IsDeleted] = 0").IsUnique();

            // Self-referencia padre/hijo
            e.HasOne(p => p.ProductoPadre)
             .WithMany(p => p.Hijos)
             .HasForeignKey(p => p.ProductoPadreId)
             .OnDelete(DeleteBehavior.Restrict);

            // Categoria
            e.HasOne(p => p.Categoria)
             .WithMany(c => c.Productos)
             .HasForeignKey(p => p.CategoriaId)
             .OnDelete(DeleteBehavior.Restrict);

            e.HasQueryFilter(p => !p.IsDeleted);
        });

        // ── PrecioProducto ─────────────────────────────────────────────────
        modelBuilder.Entity<PrecioProducto>(e =>
        {
            e.ToTable("OPT_PrecioProducto");
            e.HasKey(p => p.PrecioId);
            e.Property(p => p.PrecioId).HasDefaultValueSql("NEWSEQUENTIALID()");
            e.Property(p => p.TenantId).IsRequired();
            e.Property(p => p.PrecioCosto).HasColumnType("decimal(18,2)");
            e.Property(p => p.PrecioVenta).HasColumnType("decimal(18,2)");
            e.Property(p => p.CreatedBy).HasMaxLength(100);
            e.HasIndex(p => new { p.TenantId, p.ProductoId, p.VigenciaDesde });
            e.HasOne(p => p.Producto)
             .WithMany()
             .HasForeignKey(p => p.ProductoId)
             .OnDelete(DeleteBehavior.Restrict);
            // Sin HasQueryFilter: usa VigenciaHasta para expirar, no soft delete
        });

        // ── Stock ─────────────────────────────────────────────────────────
        modelBuilder.Entity<Stock>(e =>
        {
            e.ToTable("OPT_Stock");
            e.HasKey(s => s.StockId);
            e.Property(s => s.StockId).HasDefaultValueSql("NEWSEQUENTIALID()");
            e.Property(s => s.TenantId).IsRequired();
            e.Property(s => s.CreatedBy).HasMaxLength(100);
            e.Property(s => s.UpdatedBy).HasMaxLength(100);

            e.HasIndex(s => new { s.TenantId, s.ProductoId, s.SucursalId })
             .IsUnique().HasFilter("[IsDeleted] = 0");
            e.HasIndex(s => new { s.TenantId, s.SucursalId }).HasFilter("[IsDeleted] = 0");

            e.HasOne(s => s.Producto).WithMany()
             .HasForeignKey(s => s.ProductoId).OnDelete(DeleteBehavior.Restrict);
            e.HasOne(s => s.Sucursal).WithMany()
             .HasForeignKey(s => s.SucursalId).OnDelete(DeleteBehavior.Restrict);

            e.HasQueryFilter(s => !s.IsDeleted);
        });

        // ── MovimientoStock ────────────────────────────────────────────────
        modelBuilder.Entity<MovimientoStock>(e =>
        {
            e.ToTable("OPT_MovimientoStock");
            e.HasKey(m => m.MovimientoId);
            e.Property(m => m.MovimientoId).HasDefaultValueSql("NEWSEQUENTIALID()");
            e.Property(m => m.TenantId).IsRequired();
            e.Property(m => m.TipoMovimiento).HasMaxLength(25).IsRequired();
            e.Property(m => m.Referencia).HasMaxLength(100);
            e.Property(m => m.Observacion).HasMaxLength(500);
            e.Property(m => m.CreatedBy).HasMaxLength(100);

            e.HasIndex(m => new { m.TenantId, m.ProductoId, m.SucursalId, m.FechaMovimiento });
            e.HasIndex(m => new { m.UsuarioId, m.FechaMovimiento });

            e.HasOne(m => m.Producto).WithMany()
             .HasForeignKey(m => m.ProductoId).OnDelete(DeleteBehavior.Restrict);
            e.HasOne(m => m.Sucursal).WithMany()
             .HasForeignKey(m => m.SucursalId).OnDelete(DeleteBehavior.Restrict);
            e.HasOne(m => m.Usuario).WithMany()
             .HasForeignKey(m => m.UsuarioId).OnDelete(DeleteBehavior.Restrict);
            e.HasOne(m => m.Documento)
             .WithMany(d => d.Movimientos)
             .HasForeignKey(m => m.DocumentoId)
             .OnDelete(DeleteBehavior.Restrict);
            e.HasOne(m => m.Transferencia)
             .WithMany(t => t.Movimientos)
             .HasForeignKey(m => m.TransferenciaId)
             .OnDelete(DeleteBehavior.Restrict);
            // Sin HasQueryFilter: los movimientos son inmutables, sin IsDeleted
        });

        // ── DocumentoEntrada ───────────────────────────────────────────────
        modelBuilder.Entity<DocumentoEntrada>(e =>
        {
            e.ToTable("OPT_DocumentoEntrada");
            e.HasKey(d => d.DocumentoId);
            e.Property(d => d.DocumentoId).HasDefaultValueSql("NEWSEQUENTIALID()");
            e.Property(d => d.TenantId).IsRequired();
            e.Property(d => d.TipoDocumento).HasMaxLength(20).IsRequired();
            e.Property(d => d.NumeroDocumento).HasMaxLength(50);
            e.Property(d => d.ProveedorNombre).HasMaxLength(200);
            e.Property(d => d.ProveedorRut).HasMaxLength(20);
            e.Property(d => d.Estado).HasMaxLength(20).IsRequired().HasDefaultValue("Borrador");
            e.Property(d => d.Observaciones).HasMaxLength(2000);
            e.Property(d => d.CreatedBy).HasMaxLength(100);
            e.Property(d => d.UpdatedBy).HasMaxLength(100);

            e.HasIndex(d => new { d.TenantId, d.SucursalId, d.FechaDocumento });
            e.HasIndex(d => new { d.TenantId, d.TipoDocumento, d.Estado });

            e.HasOne(d => d.Sucursal).WithMany()
             .HasForeignKey(d => d.SucursalId).OnDelete(DeleteBehavior.Restrict);

            e.HasQueryFilter(d => !d.IsDeleted);
        });

        // ── DocumentoEntradaLinea ──────────────────────────────────────────
        modelBuilder.Entity<DocumentoEntradaLinea>(e =>
        {
            e.ToTable("OPT_DocumentoEntradaLinea");
            e.HasKey(l => l.LineaId);
            e.Property(l => l.LineaId).HasDefaultValueSql("NEWSEQUENTIALID()");
            e.Property(l => l.TenantId).IsRequired();
            e.Property(l => l.PrecioCosto).HasColumnType("decimal(18,2)");
            e.Property(l => l.Observaciones).HasMaxLength(500);

            e.HasIndex(l => l.DocumentoId);

            e.HasOne(l => l.Documento)
             .WithMany(d => d.Lineas)
             .HasForeignKey(l => l.DocumentoId)
             .OnDelete(DeleteBehavior.Cascade);
            e.HasOne(l => l.Producto).WithMany()
             .HasForeignKey(l => l.ProductoId).OnDelete(DeleteBehavior.Restrict);
        });

        // ── Transferencia ─────────────────────────────────────────────────
        modelBuilder.Entity<Transferencia>(e =>
        {
            e.ToTable("OPT_Transferencia");
            e.HasKey(t => t.TransferenciaId);
            e.Property(t => t.TransferenciaId).HasDefaultValueSql("NEWSEQUENTIALID()");
            e.Property(t => t.TenantId).IsRequired();
            e.Property(t => t.Estado).HasMaxLength(20).IsRequired().HasDefaultValue("Pendiente");
            e.Property(t => t.Observaciones).HasMaxLength(500);
            e.Property(t => t.CreatedBy).HasMaxLength(100);
            e.Property(t => t.UpdatedBy).HasMaxLength(100);

            e.HasIndex(t => new { t.TenantId, t.Estado });

            e.HasOne(t => t.SucursalOrigen).WithMany()
             .HasForeignKey(t => t.SucursalOrigenId).OnDelete(DeleteBehavior.Restrict);
            e.HasOne(t => t.SucursalDestino).WithMany()
             .HasForeignKey(t => t.SucursalDestinoId).OnDelete(DeleteBehavior.Restrict);

            e.HasQueryFilter(t => !t.IsDeleted);
        });

        // ── TransferenciaLinea ─────────────────────────────────────────────
        modelBuilder.Entity<TransferenciaLinea>(e =>
        {
            e.ToTable("OPT_TransferenciaLinea");
            e.HasKey(l => l.LineaId);
            e.Property(l => l.LineaId).HasDefaultValueSql("NEWSEQUENTIALID()");
            e.Property(l => l.TenantId).IsRequired();

            e.HasIndex(l => l.TransferenciaId);

            e.HasOne(l => l.Transferencia)
             .WithMany(t => t.Lineas)
             .HasForeignKey(l => l.TransferenciaId)
             .OnDelete(DeleteBehavior.Cascade);
            e.HasOne(l => l.Producto).WithMany()
             .HasForeignKey(l => l.ProductoId).OnDelete(DeleteBehavior.Restrict);
        });
    }
}
