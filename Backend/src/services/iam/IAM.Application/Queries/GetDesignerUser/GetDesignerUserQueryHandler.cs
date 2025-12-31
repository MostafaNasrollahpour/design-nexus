using IAM.Domain.Interfaces;
using MediatR;
using System.Threading;
using System.Threading.Tasks;
using IAM.Application.DTOs;


namespace IAM.Application.Queries.GetDesignerUser;

public class GetDesignerUserQueryHandler 
    : IRequestHandler<GetDesignerUserQuery, DesignerUserDto?>
{
    private readonly IUserRepository _userRepository;

    public GetDesignerUserQueryHandler(IUserRepository userRepository)
    {
        _userRepository = userRepository;
    }

    public async Task<DesignerUserDto?> Handle(
        GetDesignerUserQuery request,
        CancellationToken cancellationToken)
    {
        var user = await _userRepository.GetByIdAsync(request.DesignerId);

        if (user is null)
            return null;

        return new DesignerUserDto(
            user.UserId,
            user.FullName,
            user.Email,
            user.Role,
            user.IsVerified,
            user.CreatedAt,
            user.UpdatedAt
        );
    }
}
