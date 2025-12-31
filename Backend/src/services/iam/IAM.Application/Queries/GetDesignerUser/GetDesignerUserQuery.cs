using MediatR;
using IAM.Application.DTOs;

namespace IAM.Application.Queries.GetDesignerUser;

public record GetDesignerUserQuery(int DesignerId) : IRequest<DesignerUserDto?>;

