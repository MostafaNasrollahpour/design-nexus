using MediatR;
using Request.Application.DTOs;
using Request.Domain.Enums;
using Request.Domain.Interfaces;

namespace Request.Application.Commands.UpdateProjectRequestStatus
{
    public class UpdateProjectRequestStatusCommandHandler 
        : IRequestHandler<UpdateProjectRequestStatusCommand, BaseResponseDto>
    {
        private readonly IProjectRequestRepository _projectRequestRepository;
        private readonly ICurrentUser _currentUser;

        public UpdateProjectRequestStatusCommandHandler(
            IProjectRequestRepository projectRequestRepository,
            ICurrentUser currentUser)
        {
            _projectRequestRepository = projectRequestRepository;
            _currentUser = currentUser;
        }

        public async Task<BaseResponseDto> Handle(
            UpdateProjectRequestStatusCommand request, 
            CancellationToken cancellationToken)
        {
            try
            {
                var projectRequest = await _projectRequestRepository
                    .GetByIdAsync(request.Request.RequestId);

                if (projectRequest == null)
                {
                    return BaseResponseDto.FailureResponse("درخواست پروژه یافت نشد.");
                }

                if (!Enum.IsDefined(typeof(RequestStatus), request.Request.Status))
                {
                    return BaseResponseDto.FailureResponse("وضعیت درخواست معتبر نیست.");
                }

                var newStatus = (RequestStatus)request.Request.Status;

                if (newStatus != RequestStatus.Accepted && newStatus != RequestStatus.Cancelled)
                {
                    return BaseResponseDto.FailureResponse("فقط وضعیت‌های Accepted (1) و Cancelled (3) مجاز هستند.");
                }

                if (projectRequest.Status != RequestStatus.Pending)
                {
                    return BaseResponseDto.FailureResponse(
                        $"درخواست در وضعیت {projectRequest.Status} است و نمی‌توان تغییر وضعیت داد.");
                }

                if (newStatus == RequestStatus.Accepted || newStatus == RequestStatus.Cancelled)
                {
                    if (_currentUser.Role != "طراح")
                    {
                        return BaseResponseDto.FailureResponse(
                            "فقط طراحان می‌توانند وضعیت درخواست را تغییر دهند.");
                    }
                    if (projectRequest.DesignerId != _currentUser.UserId)
                    {
                        return BaseResponseDto.FailureResponse(
                            "شما مجاز به تغییر وضعیت این درخواست نیستید.");
                    }
                }

                projectRequest.UpdateStatus(newStatus);
                await _projectRequestRepository.UpdateAsync(projectRequest);

                return BaseResponseDto.SuccessResponse(
                    $"وضعیت درخواست با موفقیت به {GetPersianStatusName(newStatus)} تغییر یافت.");
            }
            catch (Exception ex)
            {
                return BaseResponseDto.FailureResponse($"خطا در تغییر وضعیت درخواست: {ex.Message}");
            }
        }

        private string GetPersianStatusName(RequestStatus status)
        {
            return status switch
            {
                RequestStatus.Pending => "در انتظار",
                RequestStatus.Accepted => "پذیرفته شده",
                RequestStatus.Completed => "تکمیل شده",
                RequestStatus.Cancelled => "لغو شده",
                _ => "نامشخص"
            };
        }
    }
}