using MediatR;
using Request.Application.DTOs;

namespace Request.Application.Commands.CreateProjectRequest
{
    public class CreateProjectRequestCommand : IRequest<BaseResponseDto>
    {
        public CreateProjectRequestDto Request { get; }

        public CreateProjectRequestCommand(CreateProjectRequestDto request)
        {
            Request = request;
        }
    }
}