using MediatR;
using PortFolioService.Application.DTOs;

namespace PortFolioService.Application.Queries.GetPortfolioByDesigner;

public record GetPortfolioByDesignerQuery(int DesignerId)
    : IRequest<List<PortfolioListItemDto>>;

