using PortFolioService.Application.DTOs;
using MediatR;

namespace PortFolioService.Application.Commands.CreatePortfolio
{
    public class CreatePortfolioCommand : IRequest<PortfolioResponseDto>
    {
        public CreatePortfolioRequestDto Request { get; }

        public CreatePortfolioCommand(CreatePortfolioRequestDto request)
        {
            Request = request;
        }
    }
}