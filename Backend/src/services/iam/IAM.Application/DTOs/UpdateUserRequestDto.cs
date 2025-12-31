using System.ComponentModel.DataAnnotations;

namespace IAM.Application.DTOs
{
    public class UpdateUserRequestDto
    {
        [StringLength(100, ErrorMessage = "نام کامل نمی‌تواند بیش از 100 کاراکتر باشد")]
        public string? FullName { get; set; }

        public string? CurrentPassword { get; set; }

        public string? NewPassword { get; set; }

        [Compare(nameof(NewPassword), ErrorMessage = "رمز عبور و تکرار آن مطابقت ندارند")]
        public string? ConfirmNewPassword { get; set; }
    }
}