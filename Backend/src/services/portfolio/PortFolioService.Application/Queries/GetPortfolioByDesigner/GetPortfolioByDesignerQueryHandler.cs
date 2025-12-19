using System;
using MediatR;
using PortFolioService.Application.DTOs;
using PortFolioService.Domain.Interfaces;

namespace PortFolioService.Application.Queries.GetPortfolioByDesigner;

public class GetPortfolioByDesignerQueryHandler
    : IRequestHandler<GetPortfolioByDesignerQuery, List<PortfolioListItemDto>>
{
    private readonly IPortfolioRepository _repository;

    public GetPortfolioByDesignerQueryHandler(
        IPortfolioRepository repository)
    {
        _repository = repository;
    }

    public async Task<List<PortfolioListItemDto>> Handle(
        GetPortfolioByDesignerQuery request,
        CancellationToken ct)
    {
        var portfolios = await _repository.GetByDesignerIdAsync(
            request.DesignerId, ct);

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

