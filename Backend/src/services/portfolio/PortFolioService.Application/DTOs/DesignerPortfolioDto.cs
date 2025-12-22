using Microsoft.AspNetCore.Http;

namespace PortFolioService.Application.DTOs;

public class PortfolioDetailDto
{
    public int Id { get; set; }
    public string Title { get; set; } = default!;
    public string ImageUrl { get; set; } = default!;
    public int? CategoryId { get; set; }
    public int DesignerId { get; set; }
    public string? Description { get; set; } = default!;

    public string? Location { get; set; }
    public string? Biography { get; set; }
    public string? Expertise { get; set; }
}

