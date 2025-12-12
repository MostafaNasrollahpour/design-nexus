using IAM.Application.DTOs;
using MediatR;

namespace IAM.Application.Commands.VerifyOtp
{
    public class VerifyOtpCommand : IRequest<AuthResponseDto>
    {
        public VerifyOtpRequestDto Request { get; }

        public VerifyOtpCommand(VerifyOtpRequestDto request)
        {
            Request = request;
        }
    }
}