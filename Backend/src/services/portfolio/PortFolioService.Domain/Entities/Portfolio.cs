using System;

namespace PortFolioService.Domain.Entities;

public class Portfolio
{
    public int Id { get; private set; }

    public int DesignerId { get; private set; }

    public string Title { get; private set; } = null!;
    public string? Description { get; private set; }

    public int? CategoryId { get; private set; }

    public string ImageUrl { get; private set; } = null!;
    public long ImageSize { get; private set; }

    public DateTime CreatedAt { get; private set; }

    private Portfolio() { } // for EF

    public Portfolio(
        int designerId,
        string title,
        string? description,
        int? categoryId,
        string imageUrl,
        long imageSize)
    {
        DesignerId = designerId;
        Title = title;
        Description = description;
        CategoryId = categoryId;
        ImageUrl = imageUrl;
        ImageSize = imageSize;
        CreatedAt = DateTime.UtcNow;
    }

    public void UpdateTitle(string title) => Title = title;
    public void UpdateDescription(string? description) => Description = description;
    public void UpdateCategory(int categoryId) => CategoryId = categoryId;

    public void UpdateImage(string imageUrl, long imageSize)
    {
        ImageUrl = imageUrl;
        ImageSize = imageSize;
    }
}

