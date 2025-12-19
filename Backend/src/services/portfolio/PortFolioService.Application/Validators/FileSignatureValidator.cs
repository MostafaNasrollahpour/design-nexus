using System;

namespace PortFolioService.Application.Validators;


public static class FileSignatureValidator
{

    public const int MaxImageSize = 2 * 1024 * 1024;
    public static readonly string[] AllowedMimeTypes =
    {
        "image/jpeg",
        "image/png",
        "image/webp"
    };
    private static readonly Dictionary<string, byte[][]> FileSignatures =
        new()
        {
            ["image/jpeg"] = new[]
            {
                new byte[] { 0xFF, 0xD8, 0xFF }
            },
            ["image/png"] = new[]
            {
                new byte[] { 0x89, 0x50, 0x4E, 0x47 }
            },
            ["image/webp"] = new[]
            {
                new byte[] { 0x52, 0x49, 0x46, 0x46 }
            }
        };

    public static bool IsValid(Stream fileStream, string contentType)
    {
        if (!FileSignatures.TryGetValue(
            contentType, out var signatures))
            return false;

        var maxLength = signatures.Max(s => s.Length);
        var headerBytes = new byte[maxLength];

        fileStream.ReadExactly(headerBytes, 0, maxLength);

        fileStream.Position = 0;


        return signatures.Any(signature =>
            headerBytes.Take(signature.Length)
                       .SequenceEqual(signature));
    }
}

