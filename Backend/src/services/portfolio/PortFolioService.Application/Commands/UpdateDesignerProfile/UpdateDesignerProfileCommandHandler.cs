using MediatR;
using Microsoft.Extensions.Logging;
using PortFolioService.Domain.Entities;
using PortFolioService.Domain.Interfaces;
using PortFolioService.Application.DTOs;
using PortFolioService.Application.Validators;

namespace PortFolioService.Application.Commands.UpdateDesignerProfile;

public class UpdateDesignerProfileCommandHandler
    : IRequestHandler<UpdateDesignerProfileCommand, ResultDto>
{
    private readonly IDesignerProfileRepository _designerProfileRepository;
    private readonly IFileStorage _fileStorage;
    private readonly ICurrentUser _currentUser;
    private readonly ILogger<UpdateDesignerProfileCommandHandler> _logger;

    public UpdateDesignerProfileCommandHandler(
        IDesignerProfileRepository designerProfileRepository,
        IFileStorage fileStorage,
        ICurrentUser currentUser,
        ILogger<UpdateDesignerProfileCommandHandler> logger)
    {
        _designerProfileRepository = designerProfileRepository;
        _fileStorage = fileStorage;
        _currentUser = currentUser;
        _logger = logger;
    }

    public async Task<ResultDto> Handle(
        UpdateDesignerProfileCommand request,
        CancellationToken ct)
    {
        _logger.LogInformation(
            "UpdateDesignerProfile called by UserId={UserId}, Role={Role}",
            _currentUser.UserId,
            _currentUser.Role);

        if (_currentUser.Role != "طراح")
            return ResultDto.FailureResult("دسترسی ندارید.");

        var dto = request.Request;

        if (string.IsNullOrWhiteSpace(dto.Bio) &&
            string.IsNullOrWhiteSpace(dto.Location) &&
            string.IsNullOrWhiteSpace(dto.Specialty) &&
            dto.AvatarFile is null)
        {
            return ResultDto.FailureResult("حداقل یکی از فیلدها باید ارسال شود.");
        }

        var profile = await _designerProfileRepository
            .GetByDesignerIdAsync(_currentUser.UserId, ct);

        if (profile is null)
        {
            profile = new DesignerProfile(
                _currentUser.UserId,
                dto.Bio,
                dto.Location,
                dto.Specialty);

            await _designerProfileRepository.AddAsync(profile, ct);
        }
        else
        {
            profile.UpdateProfile(dto.Bio, dto.Location, dto.Specialty);
        }

        if (dto.AvatarFile is not null)
        {
            var file = dto.AvatarFile;

            if (file.Length == 0)
                return ResultDto.FailureResult("فایل تصویر معتبر نیست.");

            if (file.Length > FileSignatureValidator.MaxImageSize)
                return ResultDto.FailureResult("حجم عکس بیش از حد مجاز است.");

            if (!FileSignatureValidator.AllowedMimeTypes.Contains(file.ContentType))
                return ResultDto.FailureResult("فرمت تصویر پشتیبانی نمی‌شود.");

            using var stream = file.OpenReadStream();
            if (!FileSignatureValidator.IsValid(stream, file.ContentType))
                return ResultDto.FailureResult("محتوای تصویر معتبر نیست.");

            var avatarUrl = await _fileStorage.SaveAsync(
                file,
                $"designer-avatar-{_currentUser.UserId}",
                ct);

            profile.UpdateAvatar(avatarUrl, file.Length);
        }

        await _designerProfileRepository.SaveChangesAsync(ct);

        return ResultDto.SuccessResult(
            
        );
    }
}
