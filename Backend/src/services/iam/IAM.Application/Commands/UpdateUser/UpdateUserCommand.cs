using IAM.Application.DTOs;
using MediatR;

namespace IAM.Application.Commands.UpdateUser
{
    public class UpdateUserCommand : IRequest<AuthResponseDto>
    {
        public UpdateUserRequestDto Request { get; }
        public string RefreshToken { get; }

        public UpdateUserCommand(UpdateUserRequestDto request, string refreshToken)
        {
            Request = request;
            RefreshToken = refreshToken;
        }
    }
}