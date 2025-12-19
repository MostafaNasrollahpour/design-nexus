using System;
using MediatR;
using PortFolioService.Application.DTOs;
using PortFolioService.Domain.Interfaces;

namespace PortFolioService.Application.Queries.GetPortfolioByCategory;

public class GetPortfolioByCategoryQueryHandler
    : IRequestHandler<GetPortfolioByCategoryQuery, List<PortfolioListItemDto>>
{
    private readonly IPortfolioRepository _repository;

    public GetPortfolioByCategoryQueryHandler(
        IPortfolioRepository repository)
    {
        _repository = repository;
    }

    public async Task<List<PortfolioListItemDto>> Handle(
        GetPortfolioByCategoryQuery request,
        CancellationToken ct)
    {
        var portfolios = await _repository.GetByCategoryIdAsync(
            request.CategoryId, ct);

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

