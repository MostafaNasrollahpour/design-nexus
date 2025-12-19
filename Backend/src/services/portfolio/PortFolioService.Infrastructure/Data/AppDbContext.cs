using Microsoft.EntityFrameworkCore;
using PortFolioService.Domain.Entities;

namespace PortFolioService.Infrastructure.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<Portfolio> Portfolios { get; set; } = default!;
    public DbSet<Category> Categories { get; set; } = default!;

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Portfolio table
        modelBuilder.Entity<Portfolio>(entity =>
        {
            entity.ToTable("portfolios");

            entity.HasKey(p => p.Id);
            entity.Property(p => p.Id)
                  .HasColumnName("portfolio_id")
                  .ValueGeneratedOnAdd();

            entity.Property(p => p.DesignerId)
                  .HasColumnName("designer_id")
                  .IsRequired();

            entity.Property(p => p.Title)
                  .HasColumnName("title")
                  .HasMaxLength(150)
                  .IsRequired();

            entity.Property(p => p.Description)
                  .HasColumnName("description");

            entity.Property(p => p.CategoryId)
                  .HasColumnName("category_id");

            entity.Property(p => p.ImageUrl)
                  .HasColumnName("image_url")
                  .IsRequired();

            entity.Property(p => p.ImageSize)
                  .HasColumnName("image_size")
                  .IsRequired();

            entity.Property(p => p.CreatedAt)
                  .HasColumnName("created_at")
                  .IsRequired();
        });

        // Category table
        modelBuilder.Entity<Category>(entity =>
        {
            entity.ToTable("categories");

            entity.HasKey(c => c.Id);
            entity.Property(c => c.Id)
                  .HasColumnName("category_id")
                  .ValueGeneratedOnAdd();

            entity.Property(c => c.Name)
                  .HasColumnName("name")
                  .HasMaxLength(100)
                  .IsRequired();

            entity.Property(c => c.Description)
                  .HasColumnName("description");

            // Seed data for categories
            entity.HasData(
                  new Category(1, "اتاق خواب", null),
                  new Category(2, "پذیرایی", null),
                  new Category(3, "آشپزخانه", null),
                  new Category(4, "اتاق کار", null),
                  new Category(5, "عروسی و نامزدی", null),
                  new Category(6, "جشن تولد", null),
                  new Category(7, "کافی شاپ و رستوران", null)
            );
        });

        
    }
}
