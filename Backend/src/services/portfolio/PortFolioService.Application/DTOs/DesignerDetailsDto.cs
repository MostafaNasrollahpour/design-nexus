namespace PortFolioService.Application.DTOs;

public record DesignerDetailsDto(
    int DesignerId,
    string FullName,
    string Email,
    string Role,
    bool IsVerified,
    string? Bio,
    string? Location,
    string? Specialty,
    string? AvatarUrl,
    long? AvatarSize
);

