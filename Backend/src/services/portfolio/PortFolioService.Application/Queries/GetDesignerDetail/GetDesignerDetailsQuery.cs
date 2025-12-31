using MediatR;
using PortFolioService.Application.DTOs;

namespace PortFolioService.Application.Queries.GetDesignerDetails;

public record GetDesignerDetailsQuery(int DesignerId)
    : IRequest<DesignerDetailsResponse>;

