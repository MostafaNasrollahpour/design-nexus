using IAM.Application.DTOs;
using MediatR;

namespace IAM.Application.Commands.VerifyChangePassword
{
    public class VerifyChangePasswordCommand : IRequest<AuthResponseDto>
    {
        public VerifyChangePasswordRequestDto Request { get; }

        public VerifyChangePasswordCommand(VerifyChangePasswordRequestDto request)
        {
            Request = request;
        }
    }
}