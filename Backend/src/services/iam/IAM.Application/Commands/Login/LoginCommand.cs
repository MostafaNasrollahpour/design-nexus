using IAM.Application.DTOs;
using MediatR;

namespace IAM.Application.Commands.Login
{
    public class LoginCommand : IRequest<AuthResponseDto>
    {
        public LoginRequestDto Request { get; }

        public LoginCommand(LoginRequestDto request)
        {
            Request = request;
        }
    }
}