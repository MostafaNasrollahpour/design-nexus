using MediatR;
using PortFolioService.Application.DTOs;
using PortFolioService.Domain.Interfaces;

namespace PortFolioService.Application.Queries.GetPortfolioByDesigner;

public class GetMyPortfolioQueryHandler
    : IRequestHandler<GetMyPortfolioQuery, List<PortfolioListItemDto>>
{
    private readonly IPortfolioRepository _repository;
    private readonly ICurrentUser _currentUser;

    public GetMyPortfolioQueryHandler(
        IPortfolioRepository repository,
        ICurrentUser currentUser)
    {
        _repository = repository;
        _currentUser = currentUser;
    }

    public async Task<List<PortfolioListItemDto>> Handle(
        GetMyPortfolioQuery request,
        CancellationToken ct)
    {
        // اگر دوست داری اینجا هم مثل Create چک رول انجام بده:
        if (_currentUser.Role != "طراح")
            return new List<PortfolioListItemDto>(); // یا بهتر: throw / Result pattern

        var portfolios = await _repository.GetByDesignerIdAsync(_currentUser.UserId, ct);

        return portfolios.Select(p => new PortfolioListItemDto
        {
            Id = p.Id,
            Title = p.Title,
            ImageUrl = p.ImageUrl,
            CategoryId = p.CategoryId,
            DesignerId = p.DesignerId
        }).ToList();
    }
}
