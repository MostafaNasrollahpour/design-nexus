namespace Request.Application.DTOs
{
    public class CreateProjectRequestDto
    {
        public required string Title { get; set; }
        public required int CategoryId { get; set; }
        public decimal? Budget { get; set; }
        public required string Address { get; set; }
        public DateTime? Deadline { get; set; }
        public required string Description { get; set; }
        public int? DesignerId { get; set; }
    }
}