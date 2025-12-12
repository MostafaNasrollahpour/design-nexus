using IAM.Application.DTOs;
using MediatR;

namespace IAM.Application.Commands.ChangePassword
{
    public class ChangePasswordCommand : IRequest<AuthResponseDto>
    {
        public ChangePasswordRequestDto Request { get; }

        public ChangePasswordCommand(ChangePasswordRequestDto request)
        {
            Request = request;
        }
    }
}
