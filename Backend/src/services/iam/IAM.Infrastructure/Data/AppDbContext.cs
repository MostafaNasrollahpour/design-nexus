using IAM.Domain.Entities;
using Microsoft.EntityFrameworkCore;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<User> Users { get; set; } = default!;
    public DbSet<RefreshToken> RefreshTokens { get; set; } = default!;

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(e => e.UserId);
            entity.Property(e => e.UserId).ValueGeneratedOnAdd();
            entity.Property(e => e.FullName).IsRequired().HasMaxLength(100);
            entity.Property(e => e.Email).IsRequired().HasMaxLength(150);
            entity.HasIndex(e => e.Email).IsUnique();
            entity.Property(e => e.PasswordHash).IsRequired().HasMaxLength(255);
            entity.Property(e => e.Role).IsRequired().HasMaxLength(10);
            entity.Property(e => e.IsVerified).IsRequired().HasDefaultValue(false);
            entity.Property(e => e.CreatedAt).IsRequired().HasColumnType("timestamp with time zone");
            entity.Property(e => e.UpdatedAt).IsRequired().HasColumnType("timestamp with time zone");
        });

        modelBuilder.Entity<RefreshToken>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Token).IsRequired();
            entity.Property(e => e.CreatedAt).IsRequired().HasColumnType("timestamp with time zone");
            entity.Property(e => e.ExpiresAt).IsRequired().HasColumnType("timestamp with time zone");
            entity.Property(e => e.IsRevoked).IsRequired();
            entity.HasOne(rt => rt.User)
                  .WithMany()
                  .HasForeignKey(rt => rt.UserId)
                  .OnDelete(DeleteBehavior.Cascade);
            entity.HasIndex(e => e.Token).IsUnique();
        });
    }
}
