using IAM.Application.DTOs;
using MediatR;

namespace IAM.Application.Commands.Register
{
    public class RegisterCommand : IRequest<AuthResponseDto>
    {
        public RegisterRequestDto Request { get; }

        public RegisterCommand(RegisterRequestDto request)
        {
            Request = request;
        }
    }
}