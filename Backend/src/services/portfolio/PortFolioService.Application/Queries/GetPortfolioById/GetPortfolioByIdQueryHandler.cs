using System;
using MediatR;
using PortFolioService.Domain.Interfaces;
using PortFolioService.Application.DTOs;

namespace PortFolioService.Application.Queries.GetPortfolioById;


public class GetPortfolioByIdQueryHandler
    : IRequestHandler<GetPortfolioByIdQuery, PortfolioDetailDto>
{
    private readonly IPortfolioRepository _portfolioRepository;
    private readonly IDesignerProfileRepository _designerProfileRepository;

    public GetPortfolioByIdQueryHandler(
        IPortfolioRepository portfolioRepository,
        IDesignerProfileRepository designerProfileRepository)
    {
        _portfolioRepository = portfolioRepository;
        _designerProfileRepository = designerProfileRepository;
    }

    public async Task<PortfolioDetailDto> Handle(
        GetPortfolioByIdQuery request,
        CancellationToken ct)
    {
        var portfolio = await _portfolioRepository
            .GetByIdAsync(request.PortfolioId, ct);

        if (portfolio is null)
            throw new Exception("Portfolio not found"); // بهتره بعداً Custom Exception بذاری

        var designerProfile = await _designerProfileRepository
            .GetByDesignerIdAsync(portfolio.DesignerId, ct);

        return new PortfolioDetailDto
        {
            Id = portfolio.Id,
            Title = portfolio.Title,
            ImageUrl = portfolio.ImageUrl,
            CategoryId = portfolio.CategoryId,
            DesignerId = portfolio.DesignerId,
            Description = portfolio.Description,

            Location = designerProfile?.Location,
            Biography = designerProfile?.Bio,
            Expertise = designerProfile?.Specialty
        };
    }
}

