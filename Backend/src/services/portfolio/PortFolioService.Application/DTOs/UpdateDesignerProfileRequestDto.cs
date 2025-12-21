using Microsoft.AspNetCore.Http;

namespace PortFolioService.Application.DTOs;

public class UpdateDesignerProfileRequestDto
{
    public string? Bio { get; set; }
    public string? Location { get; set; }
    public string? Specialty { get; set; }

    public IFormFile? Profile { get; set; }
}
