using MediatR;
using PortFolioService.Application.DTOs;

namespace PortFolioService.Application.Queries.GetPortfolioByDesigner;

public record GetMyPortfolioQuery() : IRequest<List<PortfolioListItemDto>>;
