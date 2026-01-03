using MediatR;
using Request.Application.DTOs;
using Request.Domain.Entities;
using Request.Domain.Interfaces;

namespace Request.Application.Commands.CreateProjectRequest
{
    public class CreateProjectRequestCommandHandler : IRequestHandler<CreateProjectRequestCommand, BaseResponseDto>
    {
        private readonly IProjectRequestRepository _projectRequestRepository;
        private readonly ICurrentUser _currentUser;
        private readonly IUserServiceClient _userServiceClient;

        public CreateProjectRequestCommandHandler(IProjectRequestRepository projectRequestRepository, ICurrentUser currentUser, IUserServiceClient userServiceClient)
        {
            _projectRequestRepository = projectRequestRepository;
            _currentUser = currentUser;
            _userServiceClient = userServiceClient;
        }

        public async Task<BaseResponseDto> Handle(CreateProjectRequestCommand request, CancellationToken cancellationToken)
        {
            try
            {
                if (request.Request.DesignerId.HasValue && request.Request.DesignerId.Value == _currentUser.UserId)
                {
                    return BaseResponseDto.FailureResponse("شما نمی‌توانید برای خودتان درخواست پروژه ایجاد کنید.");
                }

                if (request.Request.DesignerId.HasValue)
                {
                    var designer = await _userServiceClient.GetDesignerUserAsync(request.Request.DesignerId.Value);
                    if (designer is null)
                    {
                        return BaseResponseDto.FailureResponse($"طراح با آیدی {request.Request.DesignerId.Value} وجود ندارد.");
                    }

                    // Optional: enforce role check
                    if (designer.Role == "کاربر") // or "Designer" if that's the proper role
                    {
                        return BaseResponseDto.FailureResponse($"کاربر با آیدی {request.Request.DesignerId.Value} یک طراح نیست.");
                    }
                }

                var projectRequest = new ProjectRequest(
                    _currentUser.UserId,
                    request.Request.Title,
                    request.Request.Description,
                    request.Request.Budget,
                    request.Request.Deadline,
                    request.Request.Address ?? string.Empty,
                    request.Request.CategoryId
                );

                if (request.Request.DesignerId.HasValue)
                {
                    projectRequest.AssignDesigner(request.Request.DesignerId.Value);
                }

                await _projectRequestRepository.AddAsync(projectRequest);

                return BaseResponseDto.SuccessResponse("درخواست پروژه با موفقیت ایجاد شد", new { RequestId = projectRequest.RequestId });
            }
            catch (Exception ex)
            {
                return BaseResponseDto.FailureResponse($"درخواست پروژه ایجاد نشد: {ex.Message}");
            }
        }
    }
}