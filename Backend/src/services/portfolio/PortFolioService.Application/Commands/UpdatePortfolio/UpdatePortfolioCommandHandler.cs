using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.Extensions.Logging;
using PortFolioService.Application.DTOs;
using PortFolioService.Domain.Entities;
using PortFolioService.Domain.Interfaces;
using PortFolioService.Application.Validators;

namespace PortFolioService.Application.Commands.UpdatePortfolio
{
    public class UpdatePortfolioCommandHandler : IRequestHandler<UpdatePortfolioCommand, PortfolioResponse>
    {
        private readonly IPortfolioRepository _repository;
        private readonly IFileStorage _fileStorage;
        private readonly ICurrentUser _currentUser;
        private readonly ILogger<UpdatePortfolioCommandHandler> _logger;

        public UpdatePortfolioCommandHandler(
            IPortfolioRepository repository,
            IFileStorage fileStorage,
            ICurrentUser currentUser,
            ILogger<UpdatePortfolioCommandHandler> logger)
        {
            _repository = repository;
            _fileStorage = fileStorage;
            _currentUser = currentUser;
            _logger = logger;
        }

        public async Task<PortfolioResponse> Handle(UpdatePortfolioCommand request, CancellationToken ct)
        {
            var portfolio = await _repository.GetByIdAsync(request.PortfolioId, ct);
            if (portfolio == null)
                return PortfolioResponse.FailureResult("پورتفولیو پیدا نشد.");

            if (portfolio.DesignerId != _currentUser.UserId)
                return PortfolioResponse.FailureResult("شما اجازه ویرایش این پورتفولیو را ندارید.");

            // Update Category if provided and valid
            if (request.Request.CategoryId >= 1 && request.Request.CategoryId <= 7)
            {
                portfolio.UpdateCategory(request.Request.CategoryId);
            }
            else if (request.Request.CategoryId != 0) // 0 means not provided
            {
                return PortfolioResponse.FailureResult("دسته بندی موجود نیست.");
            }

            // Update image if new file is provided
            if (request.Request.ImageFile != null)
            {
                var file = request.Request.ImageFile;
                if (file.Length == 0)
                    return PortfolioResponse.FailureResult("عکستان را آپلود کنید.");
                if (file.Length > FileSignatureValidator.MaxImageSize)
                    return PortfolioResponse.FailureResult("اندازه عکس بیش از حد مجاز است.");
                if (!FileSignatureValidator.AllowedMimeTypes.Contains(file.ContentType))
                    return PortfolioResponse.FailureResult("فرمت عکس پشتیبانی نمیشود.");

                using var stream = file.OpenReadStream();
                if (!FileSignatureValidator.IsValid(stream, file.ContentType))
                    return PortfolioResponse.FailureResult("محتوای عکس درست نیست.");

                if (!string.IsNullOrEmpty(portfolio.ImageUrl))
                {
                    await _fileStorage.DeleteAsync(portfolio.ImageUrl, ct);
                }

                var savedUrl = await _fileStorage.SaveAsync(file, $"designer-{_currentUser.UserId}", ct);
                portfolio.UpdateImage(savedUrl, file.Length);
            }

            // Update title if provided
            if (!string.IsNullOrWhiteSpace(request.Request.Title))
            {
                portfolio.UpdateTitle(request.Request.Title);
            }

            // Update description if provided (can be blank to clear)
            if (request.Request.Description != null)
            {
                portfolio.UpdateDescription(request.Request.Description);
            }

            // Save changes
            await _repository.UpdateAsync(portfolio, ct);

            return PortfolioResponse.SuccessResult(new PortfolioResponseDto
            {
                Id = portfolio.Id,
                DesignerId = portfolio.DesignerId,
                Title = portfolio.Title,
                Description = portfolio.Description,
                CategoryId = portfolio.CategoryId,
                ImageUrl = portfolio.ImageUrl,
                ImageSize = portfolio.ImageSize,
                CreatedAt = portfolio.CreatedAt
            });
        }
    }
}
