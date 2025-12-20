using System;
using Microsoft.AspNetCore.Http;
using System.ComponentModel.DataAnnotations;

namespace PortFolioService.Application.DTOs;


public class CreatePortfolioRequestDto
{
    [Required(ErrorMessage = "نام مناسب انتخاب کنید")]
    public required string Title { get; set; } = null!;
    public string? Description { get; set; }
    
    [Required(ErrorMessage = "دسته بندی مناسب انتخاب کنید")]
    public required int CategoryId { get; set; }

    [Required(ErrorMessage = "فایل مناسب انتخاب کنید")]
    public required IFormFile ImageFile { get; set; } = null!;
}

