using System;
using PortFolioService.Domain.Interfaces;
using System.Security.Claims;
using Microsoft.AspNetCore.Http;

namespace PortFolioService.Infrastructure.Services;

public class CurrentUser : ICurrentUser
{
    public int UserId { get; }
    public string Role { get; }

    public CurrentUser(IHttpContextAccessor accessor)
    {
        var user = accessor.HttpContext?.User;
        
        if (user == null || !user.Identity?.IsAuthenticated == true)
        {
            throw new UnauthorizedAccessException("User is not authenticated");
        }

        var nameIdClaim = user.FindFirst(ClaimTypes.NameIdentifier);
        
        if (nameIdClaim == null)
        {
            nameIdClaim = user.FindFirst("nameid");
        }
        
        if (nameIdClaim == null || !int.TryParse(nameIdClaim.Value, out var userId))
        {
            throw new UnauthorizedAccessException("User ID claim not found or invalid");
        }
        
        UserId = userId;

        var roleClaim = user.FindFirst(ClaimTypes.Role);
        
        if (roleClaim == null)
        {
            roleClaim = user.FindFirst("role");
        }
        
        Role = roleClaim?.Value ?? string.Empty;
        
        Console.WriteLine($"CurrentUser created - UserId: {UserId}, Role: {Role}");
    }
}