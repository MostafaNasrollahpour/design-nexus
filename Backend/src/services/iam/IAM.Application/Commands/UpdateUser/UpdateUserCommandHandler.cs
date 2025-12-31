using System.Threading;
using System.Threading.Tasks;
using IAM.Application.DTOs;
using IAM.Domain.Interfaces;
using MediatR;
using Microsoft.Extensions.Logging;

namespace IAM.Application.Commands.UpdateUser
{
    public class UpdateUserCommandHandler : IRequestHandler<UpdateUserCommand, AuthResponseDto>
    {
        private readonly IRefreshTokenRepository _refreshRepo;
        private readonly IUserRepository _userRepository;
        private readonly ITokenService _tokenService;
        private readonly ILogger<UpdateUserCommandHandler> _logger;

        public UpdateUserCommandHandler(
            IRefreshTokenRepository refreshRepo,
            IUserRepository userRepository,
            ITokenService tokenService,
            ILogger<UpdateUserCommandHandler> logger
        )
        {
            _refreshRepo = refreshRepo;
            _userRepository = userRepository;
            _tokenService = tokenService;
            _logger = logger;
        }

        public async Task<AuthResponseDto> Handle(UpdateUserCommand command, CancellationToken cancellationToken)
        {
            var request = command.Request;

            if (string.IsNullOrWhiteSpace(request.FullName) &&
                string.IsNullOrWhiteSpace(request.NewPassword) &&
                string.IsNullOrWhiteSpace(request.CurrentPassword) &&
                string.IsNullOrWhiteSpace(request.ConfirmNewPassword))
            {
                return AuthResponseDto.FailureResponse("حداقل یک فیلد باید برای به‌روزرسانی وارد شود");
            }

            var user = await _refreshRepo.GetByRefreshTokenAsync(command.RefreshToken);

            if (user == null)
            {
                _logger.LogWarning("Invalid refresh token");
                return AuthResponseDto.FailureResponse("رفرش توکن نامعتبر یا منقضی شده است");
            }

            user = await _userRepository.GetByIdAsync(user.UserId);

            if (user == null)
            {
                _logger.LogWarning("Invalid refresh token");
                return AuthResponseDto.FailureResponse("رفرش توکن نامعتبر یا منقضی شده است");
            }

            var hasChanges = false;

            if (!string.IsNullOrWhiteSpace(request.FullName))
            {
                user.UpdateFullName(request.FullName);
                hasChanges = true;
                _logger.LogInformation($"FullName updated for user: {user.Email}");
            }

            if (!string.IsNullOrWhiteSpace(request.CurrentPassword) ||
                !string.IsNullOrWhiteSpace(request.NewPassword) ||
                !string.IsNullOrWhiteSpace(request.ConfirmNewPassword))
            {
                // Validate that all password fields are provided for password change
                if (string.IsNullOrWhiteSpace(request.CurrentPassword) ||
                    string.IsNullOrWhiteSpace(request.NewPassword) ||
                    string.IsNullOrWhiteSpace(request.ConfirmNewPassword))
                {
                    return AuthResponseDto.FailureResponse("برای تغییر رمز عبور، همه فیلدهای مربوط به رمز عبور باید وارد شوند");
                }

                // Validate current password
                bool isPasswordValid = BCrypt.Net.BCrypt.Verify(request.CurrentPassword, user.PasswordHash);
                if (!isPasswordValid)
                {
                    _logger.LogWarning($"Wrong current password for email: {user.Email}");
                    return AuthResponseDto.FailureResponse("رمز عبور فعلی اشتباه است.");
                }

                if (request.NewPassword.Length < 8)
                {
                    _logger.LogWarning($"New password too short for email: {user.Email}");
                    return AuthResponseDto.FailureResponse("رمز عبور جدید باید حداقل 8 کاراکتر باشد");
                }
                // Check if new password is different from current
                if (request.CurrentPassword == request.NewPassword)
                {
                    _logger.LogWarning($"Same password for email: {user.Email}");
                    return AuthResponseDto.FailureResponse("رمز عبور جدید نباید با رمز عبور فعلی یکسان باشد");
                }

                // Validate password confirmation
                if (request.NewPassword != request.ConfirmNewPassword)
                {
                    _logger.LogWarning($"Password and Confirm password do not match for email: {user.Email}");
                    return AuthResponseDto.FailureResponse("رمز عبور جدید و تکرار آن مطابقت ندارند");
                }

                // Hash and update new password
                var newPasswordHash = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);
                user.UpdatePassword(newPasswordHash);
                hasChanges = true;

                // Remove all refresh tokens when password changes
                await _refreshRepo.RemoveByUserAsync(user.UserId);
                _logger.LogInformation($"Password updated for user: {user.Email}");
            }

            if (!hasChanges)
            {
                return AuthResponseDto.FailureResponse("هیچ تغییری اعمال نشد");
            }

            await _userRepository.UpdateAsync(user);
            var accessToken = await _tokenService.GenerateAccessTokenAsync(user);
            var refreshToken = await _tokenService.GenerateAndSaveRefreshTokenAsync(user);

            return AuthResponseDto.SuccessResponse(
                "اطلاعات کاربر با موفقیت بروزرسانی شد",
                accessToken,
                refreshToken,
                new UserDto
                {
                    UserId = user.UserId,
                    FullName = user.FullName,
                    Email = user.Email,
                    Role = user.Role,
                    IsVerified = user.IsVerified
                }
            );
        }
    }
}