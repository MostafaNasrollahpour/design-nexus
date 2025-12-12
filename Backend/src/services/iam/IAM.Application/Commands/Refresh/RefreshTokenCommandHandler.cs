using System.Threading;
using System.Threading.Tasks;
using IAM.Application.DTOs;
using IAM.Domain.Interfaces;
using MediatR;
using Microsoft.Extensions.Logging;

namespace IAM.Application.Commands.Refresh
{
    public class RefreshTokenCommandHandler : IRequestHandler<RefreshTokenCommand, AuthResponseDto>
    {
        private readonly IRefreshTokenRepository _refreshRepo;
        private readonly IUserRepository _userRepo;
        private readonly ITokenService _tokenService;

        public RefreshTokenCommandHandler(
            IRefreshTokenRepository refreshRepo,
            IUserRepository userRepo,
            ITokenService tokenService)
        {
            _refreshRepo = refreshRepo;
            _userRepo = userRepo;
            _tokenService = tokenService;
        }

        public async Task<AuthResponseDto> Handle(RefreshTokenCommand cmd, CancellationToken ct)
        {
            var token = await _refreshRepo.GetByTokenAsync(cmd.Token);

            if (token == null || token.IsRevoked || token.ExpiresAt < DateTime.UtcNow)
                return AuthResponseDto.FailureResponse("Refresh token invalid");

            var user = await _userRepo.GetByIdAsync(token.UserId);
            if (user == null)
                return AuthResponseDto.FailureResponse("User not found");

            // Rotate refresh token (امنیت بالا)
            await _refreshRepo.RevokeAsync(token);

            var newAccess = await _tokenService.GenerateAccessTokenAsync(user);
            var newRefresh = await _tokenService.GenerateAndSaveRefreshTokenAsync(user);

            return AuthResponseDto.SuccessResponse(
                "Token refreshed",
                newAccess,
                newRefresh,
                new UserDto
                {
                    UserId = user.UserId,
                    FullName = user.FullName,
                    Email = user.Email,
                    Role = user.Role,
                    IsVerified = user.IsVerified
                }
            );

        }
    }

}