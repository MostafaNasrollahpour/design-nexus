namespace Request.Application.DTOs
{
    public class ProjectRequestDto
    {
        public int RequestId { get; set; }
        public string? Title { get; set; }
        public string? Description { get; set; }
        public string? Status { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public string? DesignerName { get; set; }
        public int CategoryId { get; set; }  
        public decimal? Budget { get; set; } 
        public string? Address { get; set; }  
        public DateTime? Deadline { get; set; } 
    }
}
