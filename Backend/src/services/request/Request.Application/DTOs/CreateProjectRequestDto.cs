namespace Request.Application.DTOs
{
    public class CreateProjectRequestDto
    {
        public int? DesignerId { get; set; }
        public required string Title { get; set; }
        public required string Description { get; set; }
        public decimal? Budget { get; set; }
        public required string Address { get; set; }
        public required string Category { get; set; }
        public DateTime? Deadline { get; set; }
    }
}