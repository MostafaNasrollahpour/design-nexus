using MediatR;
using PortFolioService.Domain.Interfaces;
using PortFolioService.Application.DTOs;

namespace PortFolioService.Application.Queries.GetDesignerDetails;

public class GetDesignerDetailsQueryHandler
    : IRequestHandler<GetDesignerDetailsQuery, DesignerDetailsResponse>
{
    private readonly IUserServiceClient _userServiceClient;
    private readonly IDesignerProfileRepository _profileRepository;

    public GetDesignerDetailsQueryHandler(
        IUserServiceClient userServiceClient,
        IDesignerProfileRepository profileRepository)
    {
        _userServiceClient = userServiceClient;
        _profileRepository = profileRepository;
    }

    public async Task<DesignerDetailsResponse> Handle(
        GetDesignerDetailsQuery request,
        CancellationToken cancellationToken)
    {
        var user = await _userServiceClient
            .GetDesignerUserAsync(request.DesignerId);

        if (user is null)
            return DesignerDetailsResponse.Failure($"Designer with ID {request.DesignerId} not found.");

        var profile = await _profileRepository
            .GetByDesignerIdAsync(request.DesignerId, cancellationToken); 
        var dto = new DesignerDetailsDto(
            request.DesignerId,
            user.FullName,
            user.Email,
            user.Role,
            user.IsVerified,
            profile?.Bio,
            profile?.Location,
            profile?.Specialty,
            profile?.AvatarUrl,
            profile?.AvatarSize
        );

        return DesignerDetailsResponse.CreateSuccess(dto);
    }
}
