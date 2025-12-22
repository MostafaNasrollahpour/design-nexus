using MediatR;
using PortFolioService.Application.DTOs;

namespace PortFolioService.Application.Commands.UpdateDesignerProfile;

public class UpdateDesignerProfileCommand : IRequest<ResultDto>
{
    public UpdateDesignerProfileRequestDto Request { get; }

    public UpdateDesignerProfileCommand(UpdateDesignerProfileRequestDto request)
    {
        Request = request;
    }
}
