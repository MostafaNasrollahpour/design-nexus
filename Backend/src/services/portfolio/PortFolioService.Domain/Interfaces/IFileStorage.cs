using System;
using Microsoft.AspNetCore.Http;

namespace PortFolioService.Domain.Interfaces;

public interface IFileStorage
{
    Task<string> SaveAsync(
        IFormFile file,
        string folder,
        CancellationToken ct);
}

