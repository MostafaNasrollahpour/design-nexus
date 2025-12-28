using MediatR;
using PortFolioService.Application.DTOs;
using PortFolioService.Domain.Interfaces;

namespace PortFolioService.Application.Queries.GetAllDesigners
{
    public class GetAllDesignersQueryHandler : IRequestHandler<GetAllDesignersQuery, List<DesignerDto>>
    {
        private readonly IDesignerProfileRepository _repository;

        public GetAllDesignersQueryHandler(IDesignerProfileRepository repository)
        {
            _repository = repository;
        }

        public async Task<List<DesignerDto>> Handle(GetAllDesignersQuery request, CancellationToken ct)
        {
            var profiles = await _repository.GetAllAsync(ct); // <-- we need this method in repo

            return profiles.Select(p => new DesignerDto
            {
                Id = p.DesignerId,
                Location = p.Location ?? string.Empty,
                ImageUrl = p.AvatarUrl
            }).ToList();
        }
    }
}
