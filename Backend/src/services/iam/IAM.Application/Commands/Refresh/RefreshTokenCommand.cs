using IAM.Application.DTOs;
using MediatR;

namespace IAM.Application.Commands.Refresh
{
    public class RefreshTokenCommand : IRequest<AuthResponseDto>
    {
        public string Token { get; }

        public RefreshTokenCommand(string token)
        {
            Token = token;
        }
    }

}
