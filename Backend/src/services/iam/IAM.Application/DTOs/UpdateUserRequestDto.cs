using System.ComponentModel.DataAnnotations;

namespace IAM.Application.DTOs
{
    public class UpdateUserRequestDto
    {
        [Required(ErrorMessage = "نام کامل الزامی است")]
        [StringLength(100, ErrorMessage = "نام کامل نمی‌تواند بیش از 100 کاراکتر باشد")]
        public required string FullName { get; set; }

        [Required(ErrorMessage = "رمز عبور الزامی است")]
        [MinLength(8, ErrorMessage = "رمز عبور باید حداقل 8 کاراکتر باشد")]
        public required string CurrentPassword { get; set; }

        [Required(ErrorMessage = "رمز عبور الزامی است")]
        [MinLength(8, ErrorMessage = "رمز عبور باید حداقل 8 کاراکتر باشد")]
        public required string NewPassword { get; set; }

        [Required(ErrorMessage = "تکرار رمز عبور الزامی است")]
        [Compare(nameof(NewPassword), ErrorMessage = "رمز عبور و تکرار آن مطابقت ندارند")]
        public required string ConfirmNewPassword { get; set; }
    }
}