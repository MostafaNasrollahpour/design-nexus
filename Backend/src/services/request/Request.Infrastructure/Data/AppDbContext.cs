using Microsoft.EntityFrameworkCore;
using Request.Domain.Entities;

namespace Request.Infrastructure.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options)
        : base(options)
    {
    }

    public DbSet<ProjectRequest> ProjectRequests => Set<ProjectRequest>();
    public DbSet<Invoice> Invoices => Set<Invoice>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        ConfigureProjectRequest(modelBuilder);
        ConfigureInvoice(modelBuilder);
    }

    private static void ConfigureProjectRequest(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<ProjectRequest>(entity =>
        {
            entity.ToTable("project_requests");

            entity.HasKey(e => e.RequestId);

            entity.Property(e => e.RequestId)
                  .ValueGeneratedOnAdd();

            entity.Property(e => e.UserId)
                  .IsRequired();

            entity.Property(e => e.DesignerId)
                  .IsRequired(false);

            entity.Property(e => e.Title)
                  .HasMaxLength(200)
                  .IsRequired();

            entity.Property(e => e.Description)
                  .HasMaxLength(1000)
                  .IsRequired();

            entity.Property(e => e.Budget)
                  .HasColumnType("decimal(18,2)");

            entity.Property(e => e.Deadline)
                  .HasColumnType("timestamp with time zone");

            entity.Property(e => e.Address)
                  .HasMaxLength(300)
                  .IsRequired();

            entity.Property(e => e.CategoryId)
                  .IsRequired();

            entity.Property(e => e.Status)
                  .HasConversion<int>()
                  .IsRequired();

            entity.Property(e => e.CreatedAt)
                  .HasColumnType("timestamp with time zone")
                  .IsRequired();

            entity.Property(e => e.UpdatedAt)
                  .HasColumnType("timestamp with time zone")
                  .IsRequired();

            // Indexes
            entity.HasIndex(e => e.UserId);
            entity.HasIndex(e => e.DesignerId);
            entity.HasIndex(e => e.CategoryId);
            entity.HasIndex(e => e.Status);
        });
    }

    private static void ConfigureInvoice(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Invoice>(entity =>
        {
            entity.ToTable("invoices");

            entity.HasKey(e => e.InvoiceId);

            entity.Property(e => e.InvoiceId)
                  .ValueGeneratedOnAdd();

            entity.Property(e => e.RequestId)
                  .IsRequired();

            entity.Property(e => e.Amount)
                  .HasColumnType("decimal(18,2)")
                  .IsRequired();

            entity.Property(e => e.Currency)
                  .HasMaxLength(3)
                  .IsRequired();

            entity.Property(e => e.Status)
                  .HasConversion<int>()
                  .IsRequired();

            entity.Property(e => e.PaymentRef)
                  .HasMaxLength(100)
                  .IsRequired(false);

            entity.Property(e => e.CreatedAt)
                  .HasColumnType("timestamp with time zone")
                  .IsRequired();

            entity.Property(e => e.PaidAt)
                  .HasColumnType("timestamp with time zone");

            entity.HasOne<ProjectRequest>()
                  .WithOne()
                  .HasForeignKey<Invoice>(e => e.RequestId)
                  .OnDelete(DeleteBehavior.Cascade);

            // One invoice per request
            entity.HasIndex(e => e.RequestId)
                  .IsUnique();

            // Helpful indexes
            entity.HasIndex(e => e.Status);
            entity.HasIndex(e => e.CreatedAt);
            entity.HasIndex(e => e.PaymentRef)
                  .HasFilter("\"PaymentRef\" IS NOT NULL");
        });
    }
}
