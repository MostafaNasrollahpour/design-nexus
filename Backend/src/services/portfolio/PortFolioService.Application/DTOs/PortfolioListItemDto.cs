using System;

namespace PortFolioService.Application.DTOs;

public class PortfolioListItemDto
{
    public int Id { get; set; }
    public string Title { get; set; } = default!;
    public string ImageUrl { get; set; } = default!;
    public int? CategoryId { get; set; }   // ← nullable
    public int DesignerId { get; set; }
}


