using MediatR;
using PortFolioService.Domain.Interfaces;
using PortFolioService.Application.DTOs;

namespace PortFolioService.Application.Queries.GetDesignerDetails;

public class GetDesignerDetailsQueryHandler
    : IRequestHandler<GetDesignerDetailsQuery, DesignerDetailsDto?>
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

    public async Task<DesignerDetailsDto?> Handle(
        GetDesignerDetailsQuery request,
        CancellationToken cancellationToken)
    {
        var user = await _userServiceClient
            .GetDesignerUserAsync(request.DesignerId);

        if (user is null)
            return null;

        var profile = await _profileRepository
            .GetByDesignerIdAsync(request.DesignerId, cancellationToken); // ✅ FIX

        return new DesignerDetailsDto(
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
    }
}
