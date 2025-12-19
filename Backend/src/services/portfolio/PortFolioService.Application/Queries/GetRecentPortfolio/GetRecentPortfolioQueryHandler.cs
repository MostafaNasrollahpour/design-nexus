using MediatR;
using PortFolioService.Application.DTOs;
using PortFolioService.Domain.Interfaces;

namespace PortFolioService.Application.Queries.GetRecentPortfolio;

public class GetRecentPortfoliosQueryHandler
    : IRequestHandler<GetRecentPortfoliosQuery, List<PortfolioListItemDto>>
{
    private readonly IPortfolioRepository _repository;

    public GetRecentPortfoliosQueryHandler(
        IPortfolioRepository repository)
    {
        _repository = repository;
    }

    public async Task<List<PortfolioListItemDto>> Handle(
        GetRecentPortfoliosQuery request,
        CancellationToken ct)
    {
        var portfolios = await _repository.GetRecentAsync(
            request.Count, ct);

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
