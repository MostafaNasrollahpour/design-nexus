using MediatR;
using PortFolioService.Application.DTOs;

namespace PortFolioService.Application.Queries.GetPortfolioById;

public record GetPortfolioByIdQuery(int PortfolioId)
    : IRequest<PortfolioDetailDto>;
