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

        public CreateProjectRequestCommandHandler(IProjectRequestRepository projectRequestRepository, ICurrentUser currentUser)
        {
            _projectRequestRepository = projectRequestRepository;
            _currentUser = currentUser;
        }

        public async Task<BaseResponseDto> Handle(CreateProjectRequestCommand request, CancellationToken cancellationToken)
        {
            try
            {
                var projectRequest = new ProjectRequest(
                    _currentUser.UserId,
                    request.Request.Title,
                    request.Request.Description,
                    request.Request.Budget,
                    request.Request.Deadline,
                    request.Request.Address ?? string.Empty,
                    request.Request.Category
                );

                if (request.Request.DesignerId.HasValue)
                {
                    projectRequest.AssignDesigner(request.Request.DesignerId.Value);
                }

                await _projectRequestRepository.AddAsync(projectRequest);

                return BaseResponseDto.SuccessResponse("Project request created successfully", new { RequestId = projectRequest.RequestId });
            }
            catch (Exception ex)
            {
                return BaseResponseDto.FailureResponse($"Failed to create project request: {ex.Message}");
            }
        }
    }
}