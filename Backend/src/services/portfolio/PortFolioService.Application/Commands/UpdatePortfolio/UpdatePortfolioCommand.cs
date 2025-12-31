using MediatR;
using PortFolioService.Application.DTOs;

namespace PortFolioService.Application.Commands.UpdatePortfolio
{
    public class UpdatePortfolioCommand : IRequest<PortfolioResponse>
    {
        public int PortfolioId { get; }
        public UpdatePortfolioRequestDto Request { get; }

        public UpdatePortfolioCommand(int portfolioId, UpdatePortfolioRequestDto request)
        {
            PortfolioId = portfolioId;
            Request = request;
        }
    }
}
