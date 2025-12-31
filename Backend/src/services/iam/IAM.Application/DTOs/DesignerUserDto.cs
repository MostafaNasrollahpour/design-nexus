namespace IAM.Application.DTOs;

public record DesignerUserDto(
    int UserId,
    string FullName,
    string Email,
    string Role,
    bool IsVerified,
    DateTime CreatedAt,
    DateTime UpdatedAt
);
