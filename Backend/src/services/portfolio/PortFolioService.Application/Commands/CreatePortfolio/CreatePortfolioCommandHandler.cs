using System;
using MediatR;
using PortFolioService.Domain.Interfaces;
using PortFolioService.Application.DTOs;
using PortFolioService.Domain.Entities;
using Microsoft.Extensions.Logging;
using PortFolioService.Application.Validators;

namespace PortFolioService.Application.Commands.CreatePortfolio;

public class CreatePortfolioCommandHandler
    : IRequestHandler<CreatePortfolioCommand, PortfolioResponse>
{
    private readonly IPortfolioRepository _repository;
    private readonly IFileStorage _fileStorage;
    private readonly ICurrentUser _currentUser;
    private readonly ILogger<CreatePortfolioCommandHandler> _logger;

    public CreatePortfolioCommandHandler(
        IPortfolioRepository repository,
        IFileStorage fileStorage,
        ICurrentUser currentUser,
        ILogger<CreatePortfolioCommandHandler> logger)
    {
        _repository = repository;
        _fileStorage = fileStorage;
        _currentUser = currentUser;
        _logger = logger;
    }

    public async Task<PortfolioResponse> Handle(CreatePortfolioCommand request, CancellationToken ct)
    {
        _logger?.LogInformation($"User Role: {_currentUser.Role}, UserId: {_currentUser.UserId}");
        
        var allowedRole = "طراح";
        
        if (allowedRole != _currentUser.Role)
        {
            _logger?.LogWarning($"Access denied. User role '{_currentUser.Role}' is not allowed.");
            return PortfolioResponse.FailureResult("شما اجازه آپلود ندارید.");
        }

        var imageUrl = await _fileStorage.SaveAsync(
            request.Request.Image,
            $"designer-{_currentUser.UserId}",
            ct);

        var portfolio = new Portfolio(
            _currentUser.UserId,
            request.Request.Title,
            request.Request.Description,
            request.Request.CategoryId,
            imageUrl,
            request.Request.Image.Length);

        var file = request.Request.Image;

        if (file == null || file.Length == 0) 
            return PortfolioResponse.FailureResult("عکستان را آپلود کنید.");

        if (file.Length > FileSignatureValidator.MaxImageSize) 
            return PortfolioResponse.FailureResult("اندازه عکس بیش از حد مجاز است.");

        if (!FileSignatureValidator.AllowedMimeTypes.Contains(file.ContentType))
            return PortfolioResponse.FailureResult("فرمت عکس پشتیبانی نمیشود.");
        
        using var stream = file.OpenReadStream();
        if (!FileSignatureValidator.IsValid(stream, file.ContentType))
            return PortfolioResponse.FailureResult("محتوای عکس درست نیست.");

        await _repository.AddAsync(portfolio, ct);


        return PortfolioResponse.SuccessResult(
            new PortfolioResponseDto
            {
                Id = portfolio.Id,
                DesignerId = portfolio.DesignerId,
                Title = portfolio.Title,
                Description = portfolio.Description,
                CategoryId = portfolio.CategoryId,
                ImageUrl = portfolio.ImageUrl,
                ImageSize = portfolio.ImageSize,
                CreatedAt = portfolio.CreatedAt
            }
        );
    }
}

