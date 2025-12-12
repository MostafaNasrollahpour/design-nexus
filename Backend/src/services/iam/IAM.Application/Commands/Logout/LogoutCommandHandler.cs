using System.Threading;
using System.Threading.Tasks;
using IAM.Application.DTOs;
using IAM.Domain.Interfaces;
using MediatR;
using Microsoft.Extensions.Logging;

namespace IAM.Application.Commands.Logout
{
    public class LogoutCommandHandler : IRequestHandler<LogoutCommand, AuthResponseDto>
    {
        private readonly IRefreshTokenRepository _repo;

        public LogoutCommandHandler(IRefreshTokenRepository repo)
        {
            _repo = repo;
        }

        public async Task<AuthResponseDto> Handle(LogoutCommand cmd, CancellationToken ct)
        {
            if (!string.IsNullOrEmpty(cmd.RefreshToken))
            {
                var token = await _repo.GetByTokenAsync(cmd.RefreshToken);
                if (token != null)
                {
                    await _repo.RevokeAsync(token);
                }
            }

            return AuthResponseDto.SuccessResponse("Logged out", "", "", null!);
        }
    }

}