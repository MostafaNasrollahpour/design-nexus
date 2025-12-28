using System;

namespace PortFolioService.Application.DTOs
{
    public class DesignerDto
    {
        public int Id { get; set; }
        public string Location { get; set; } = null!;
        public string? ImageUrl { get; set; }
    }
}

