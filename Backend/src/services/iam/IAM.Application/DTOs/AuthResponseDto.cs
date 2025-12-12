namespace IAM.Application.DTOs
{
    public class AuthResponseDto
    {
        public bool Success { get; set; }
        public required string Message { get; set; }
        public string? Token { get; set; } 
        public string? RefreshToken { get; set; }
        public UserDto? User { get; set; } 

        public static AuthResponseDto SuccessResponse(string message, string token, string refreshToken, UserDto user)
        {
            return new AuthResponseDto
            {
                Success = true,
                Message = message,
                Token = token,
                RefreshToken = refreshToken,
                User = user
            };
        }

        public static AuthResponseDto FailureResponse(string message)
        {
            return new AuthResponseDto
            {
                Success = false,
                Message = message,
                Token = null,
                RefreshToken = null,
                User = null
            };
        }
    }

    public class UserDto
    {
        public int UserId { get; set; }
        public required string FullName { get; set; }
        public required string Email { get; set; }
        public required string Role { get; set; }
        public bool IsVerified { get; set; }
    }

}