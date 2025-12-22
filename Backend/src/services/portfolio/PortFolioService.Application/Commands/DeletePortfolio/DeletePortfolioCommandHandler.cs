using System;
using MediatR;
using PortFolioService.Domain.Interfaces;
using Microsoft.Extensions.Logging;
using PortFolioService.Application.DTOs;

namespace PortFolioService.Application.Commands.DeletePortfolio;

public class DeletePortfolioCommandHandler 
    : IRequestHandler<DeletePortfolioCommand, ResultDto>
{
    private readonly IPortfolioRepository _repository;
    private readonly ICurrentUser _currentUser;
    private readonly ILogger<DeletePortfolioCommandHandler> _logger;

    public DeletePortfolioCommandHandler(
        IPortfolioRepository repository,
        ICurrentUser currentUser,
        ILogger<DeletePortfolioCommandHandler> logger)
    {
        _repository = repository;
        _currentUser = currentUser;
        _logger = logger;
    }

    public async Task<ResultDto> Handle(DeletePortfolioCommand request, CancellationToken ct)
    {
        _logger?.LogInformation($"User Role: {_currentUser.Role}, UserId: {_currentUser.UserId}, PortfolioId: {request.PortfolioId}");

        // فقط طراح اجازه حذف دارد
        if (_currentUser.Role != "طراح")
        {
            _logger?.LogWarning($"Access denied. User role '{_currentUser.Role}' cannot delete portfolios.");
            return ResultDto.FailureResult("شما دسترسی ندارید");
        }

        // گرفتن Portfolio از دیتابیس
        var portfolio = await _repository.GetByIdAsync(request.PortfolioId, ct);
        if (portfolio == null)
        {
            _logger?.LogWarning($"Portfolio with Id {request.PortfolioId} not found.");
            return ResultDto.FailureResult("نمونه کار مورد نظر یافت نشد");
        }

        if (portfolio.DesignerId != _currentUser.UserId)
        {
            _logger?.LogWarning($"User {_currentUser.UserId} tried to delete portfolio {request.PortfolioId} which belongs to {portfolio.DesignerId}");
            return ResultDto.FailureResult("شما اجازه حذف این نمونه کار را ندارید");;
        }

        // حذف Portfolio
        await _repository.DeleteAsync(portfolio, ct);
        _logger?.LogInformation($"Portfolio {request.PortfolioId} deleted by user {_currentUser.UserId}");

        return ResultDto.SuccessResult();;
    }
}
