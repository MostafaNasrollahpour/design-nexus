using MediatR;
using PortFolioService.Application.DTOs;

namespace PortFolioService.Application.Commands.DeletePortfolio;

public record DeletePortfolioCommand(int PortfolioId) : IRequest<ResultDto>;