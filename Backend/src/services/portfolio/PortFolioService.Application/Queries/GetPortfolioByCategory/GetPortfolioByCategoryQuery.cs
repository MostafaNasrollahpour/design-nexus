using MediatR;
using PortFolioService.Application.DTOs;

namespace PortFolioService.Application.Queries.GetPortfolioByCategory;

public record GetPortfolioByCategoryQuery(int CategoryId)
    : IRequest<List<PortfolioListItemDto>>;
