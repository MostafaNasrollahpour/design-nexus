using System;
using Microsoft.AspNetCore.Http;

namespace PortFolioService.Application.DTOs;


public class CreatePortfolioRequestDto
{
    public string Title { get; set; } = null!;
    public string? Description { get; set; }
    public int? CategoryId { get; set; }

    public IFormFile Image { get; set; } = null!;
}

