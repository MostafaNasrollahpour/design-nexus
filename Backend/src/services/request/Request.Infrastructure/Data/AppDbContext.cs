using Microsoft.EntityFrameworkCore;
using Request.Domain.Entities;

namespace Request.Infrastructure.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<ProjectRequest> ProjectRequests { get; set; } = default!;
    public DbSet<Invoice> Invoices { get; set; } = default!;

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<ProjectRequest>(entity =>
        {
            entity.HasKey(e => e.RequestId);
            entity.Property(e => e.RequestId).ValueGeneratedOnAdd();
            entity.Property(e => e.UserId).IsRequired();
            entity.Property(e => e.DesignerId).IsRequired(false);
            entity.Property(e => e.Title).IsRequired().HasMaxLength(200);
            entity.Property(e => e.Description).IsRequired().HasMaxLength(1000);
            entity.Property(e => e.Budget).HasColumnType("decimal(18,2)");
            entity.Property(e => e.Deadline).HasColumnType("timestamp with time zone");
            entity.Property(e => e.Address).IsRequired().HasMaxLength(300);
            entity.Property(e => e.Category).IsRequired().HasMaxLength(100);
            entity.Property(e => e.Status).IsRequired().HasMaxLength(50);
            entity.Property(e => e.CreatedAt).IsRequired().HasColumnType("timestamp with time zone");
            entity.Property(e => e.UpdatedAt).IsRequired().HasColumnType("timestamp with time zone");
        });

        modelBuilder.Entity<Invoice>(entity =>
        {
            entity.HasKey(e => e.InvoiceId);
            entity.Property(e => e.InvoiceId).ValueGeneratedOnAdd();
            entity.Property(e => e.RequestId).IsRequired();
            entity.Property(e => e.Amount).IsRequired().HasColumnType("decimal(18,2)");
            entity.Property(e => e.Currency).IsRequired().HasMaxLength(3);
            entity.Property(e => e.Status).IsRequired().HasMaxLength(50);
            entity.Property(e => e.PaymentRef).IsRequired().HasMaxLength(100);
            entity.Property(e => e.CreatedAt).IsRequired().HasColumnType("timestamp with time zone");
            entity.Property(e => e.PaidAt).HasColumnType("timestamp with time zone");
            entity.HasOne<ProjectRequest>()
                  .WithMany()
                  .HasForeignKey(i => i.RequestId)
                  .OnDelete(DeleteBehavior.Cascade);
        });
    }
}