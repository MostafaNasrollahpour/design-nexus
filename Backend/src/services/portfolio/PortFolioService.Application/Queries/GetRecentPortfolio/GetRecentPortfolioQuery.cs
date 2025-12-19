using MediatR;
using PortFolioService.Application.DTOs;

namespace PortFolioService.Application.Queries.GetRecentPortfolio;

public record GetRecentPortfoliosQuery(int Count)
    : IRequest<List<PortfolioListItemDto>>;

