using System;

namespace PortFolioService.Application.DTOs;

public class PortfolioResponseDto
{
    public int Id { get; set; }
    public int DesignerId { get; set; }

    public string Title { get; set; } = null!;
    public string? Description { get; set; }

    public int? CategoryId { get; set; }

    public string ImageUrl { get; set; } = null!;
    public long ImageSize { get; set; }

    public DateTime CreatedAt { get; set; }

}

