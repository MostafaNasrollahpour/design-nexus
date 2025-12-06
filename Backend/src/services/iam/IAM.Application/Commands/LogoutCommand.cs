using MediatR;
using IAM.Application.DTOs;

namespace IAM.Application.Commands
{
    public class LogoutCommand : IRequest<AuthResponseDto>
    {
        public string? RefreshToken { get; }

        public LogoutCommand(string? token)
        {
            RefreshToken = token;
        }
    }

}