using MediatR;
using Request.Application.DTOs;

namespace Request.Application.Commands.UpdateProjectRequestStatus
{
    public class UpdateProjectRequestStatusCommand : IRequest<BaseResponseDto>
    {
        public UpdateProjectRequestStatusDto Request { get; }

        public UpdateProjectRequestStatusCommand(UpdateProjectRequestStatusDto request)
        {
            Request = request;
        }
    }
}