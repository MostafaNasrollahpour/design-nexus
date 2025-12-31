using System;

using Microsoft.AspNetCore.Http;

namespace PortFolioService.Application.DTOs
{
    public class UpdatePortfolioRequestDto
    {
        public string? Title { get; set; }
        public string? Description { get; set; }
        public int CategoryId { get; set; }
        public IFormFile? ImageFile { get; set; } // optional
    }
}
