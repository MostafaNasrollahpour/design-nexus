using MediatR;
using Request.Domain.Interfaces;
using Request.Domain.Entities;
using Request.Application.DTOs;


namespace Request.Application.Queries.GetProjectRequestsByRequester
{
    public class GetProjectRequestsByRequesterQueryHandler : IRequestHandler<GetProjectRequestsByRequesterQuery, BaseResponseDto>
    {
        private readonly IProjectRequestRepository _projectRequestRepository;
        private readonly IUserServiceClient _userServiceClient;
        private readonly ICurrentUser _currentUser;

        public GetProjectRequestsByRequesterQueryHandler(IProjectRequestRepository projectRequestRepository, IUserServiceClient userServiceClient, ICurrentUser currentUser)
        {
            _projectRequestRepository = projectRequestRepository;
            _userServiceClient = userServiceClient;
            _currentUser = currentUser;
        }

        public async Task<BaseResponseDto> Handle(GetProjectRequestsByRequesterQuery request, CancellationToken cancellationToken)
        {
            try
            {
                IEnumerable<ProjectRequest> projectRequests;

                if (_currentUser.Role == "کاربر" || _currentUser.Role == "طراح")
                {
                    projectRequests = await _projectRequestRepository.GetByUserIdAsync(_currentUser.UserId);
                }
                else
                {
                    return BaseResponseDto.FailureResponse("نقش کاربری نامعتبر است.");
                }

                var projectRequestsDto = new List<ProjectRequestDto>();

                foreach (var projectRequest in projectRequests)
                {
                    var designer = projectRequest.DesignerId.HasValue
                        ? await _userServiceClient.GetDesignerUserAsync(projectRequest.DesignerId.Value)
                        : null;

                    var projectRequestDto = new ProjectRequestDto
                    {
                        RequestId = projectRequest.RequestId,
                        Title = projectRequest.Title,
                        Description = projectRequest.Description,
                        Status = projectRequest.Status.ToString(),
                        CreatedAt = projectRequest.CreatedAt,
                        UpdatedAt = projectRequest.UpdatedAt,
                        DesignerName = designer?.FullName ?? "Unknown Designer",
                        CategoryId = projectRequest.CategoryId,  
                        Budget = projectRequest.Budget,  
                        Address = projectRequest.Address, 
                        Deadline = projectRequest.Deadline  
                    };

                    projectRequestsDto.Add(projectRequestDto);
                }

                return BaseResponseDto.SuccessResponse("عملیات موفقیت آمیز بود.", projectRequestsDto);
            }
            catch (Exception ex)
            {
                return BaseResponseDto.FailureResponse($"خطا هنگام گرفتن پروژه: {ex.Message}");
            }
        }
    }
}
