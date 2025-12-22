using System;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using PortFolioService.Domain.Interfaces;
using System.IO;
using System.Threading;
using System.Threading.Tasks;

namespace PortFolioService.Infrastructure.Services;

public class FileStorage : IFileStorage
{
    private readonly IWebHostEnvironment _env;

    public FileStorage(IWebHostEnvironment env)
    {
        _env = env;
    }

    public async Task<string> SaveAsync(IFormFile file, string folder, CancellationToken ct)
    {
        // wwwroot موجود است و مسیر کامل uploads در wwwroot ساخته می‌شود
        var webRoot = _env.WebRootPath ?? Path.Combine(_env.ContentRootPath, "wwwroot");
        var root = Path.Combine(webRoot, "uploads", folder);
        Directory.CreateDirectory(root);

        var ext = Path.GetExtension(file.FileName);
        var fileName = $"{Guid.NewGuid()}{ext}";
        var path = Path.Combine(root, fileName);

        Console.WriteLine($"[FILE SAVED TO]: {path}");

        await using var stream = new FileStream(path, FileMode.Create);
        await file.CopyToAsync(stream, ct);

        // مسیر برای فرانت (Static File)
        return $"/uploads/{folder}/{fileName}";
    }
}
