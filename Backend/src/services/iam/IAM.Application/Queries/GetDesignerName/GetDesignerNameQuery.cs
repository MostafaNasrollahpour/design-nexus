using MediatR;
namespace IAM.Application.GetDesignerName.Queries;

public record GetDesignerNameQuery(int DesignerId) : IRequest<string>;
