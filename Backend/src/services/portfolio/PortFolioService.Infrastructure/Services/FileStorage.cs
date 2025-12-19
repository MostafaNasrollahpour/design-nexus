using System;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using PortFolioService.Domain.Interfaces;

namespace PortFolioService.Infrastructure.Services;

public class FileStorage : IFileStorage
{
    private readonly IWebHostEnvironment _env;

    public FileStorage(IWebHostEnvironment env)
    {
        _env = env;
    }

    public async Task<string> SaveAsync(
        IFormFile file,
        string folder,
        CancellationToken ct)
    {
        var root = Path.Combine(_env.ContentRootPath, "uploads", folder);
        Directory.CreateDirectory(root);

        var ext = Path.GetExtension(file.FileName);
        var fileName = $"{Guid.NewGuid()}{ext}";
        var path = Path.Combine(root, fileName);

        await using var stream = new FileStream(path, FileMode.Create);
        await file.CopyToAsync(stream, ct);

        return $"/uploads/{folder}/{fileName}";
    }
}
