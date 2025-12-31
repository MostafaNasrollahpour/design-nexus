using MediatR;
using PortFolioService.Application.DTOs;
using System.Collections.Generic;

namespace PortFolioService.Application.Queries.GetAllDesigners
{
    public record GetAllDesignersQuery() : IRequest<List<DesignerDto>>;
}
