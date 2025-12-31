using IAM.Domain.Interfaces;
using MediatR;
using System.Threading;
using System.Threading.Tasks;

namespace IAM.Application.GetDesignerName.Queries;

public class GetDesignerNameQueryHandler : IRequestHandler<GetDesignerNameQuery, string?>
{
    private readonly IUserRepository _userRepository;

    public GetDesignerNameQueryHandler(IUserRepository userRepository)
    {
        _userRepository = userRepository;
    }

    public async Task<string?> Handle(GetDesignerNameQuery request, CancellationToken cancellationToken)
    {
        var user = await _userRepository.GetByIdAsync(request.DesignerId);
        return user?.FullName; // اگر نبود، null برمی‌گردد
    }
}
