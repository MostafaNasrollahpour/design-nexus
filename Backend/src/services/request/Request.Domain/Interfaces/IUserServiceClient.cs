namespace Request.Domain.Interfaces;

public interface IUserServiceClient
{
    Task<UserServiceDesignerDto?> GetDesignerUserAsync(int designerId);
}

public record UserServiceDesignerDto(
    int UserId,
    string FullName,
    string Email,
    string Role,
    bool IsVerified,
    DateTime CreatedAt,
    DateTime UpdatedAt
);


