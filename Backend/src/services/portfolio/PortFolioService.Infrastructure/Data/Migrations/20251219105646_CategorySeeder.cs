using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace PortFolioService.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class CategorySeeder : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.InsertData(
                table: "categories",
                columns: new[] { "category_id", "description", "name" },
                values: new object[,]
                {
                    { 1, null, "اتاق خواب" },
                    { 2, null, "پذیرایی" },
                    { 3, null, "آشپزخانه" },
                    { 4, null, "اتاق کار" },
                    { 5, null, "عروسی و نامزدی" },
                    { 6, null, "جشن تولد" },
                    { 7, null, "کافی شاپ و رستوران" }
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "categories",
                keyColumn: "category_id",
                keyValue: 1);

            migrationBuilder.DeleteData(
                table: "categories",
                keyColumn: "category_id",
                keyValue: 2);

            migrationBuilder.DeleteData(
                table: "categories",
                keyColumn: "category_id",
                keyValue: 3);

            migrationBuilder.DeleteData(
                table: "categories",
                keyColumn: "category_id",
                keyValue: 4);

            migrationBuilder.DeleteData(
                table: "categories",
                keyColumn: "category_id",
                keyValue: 5);

            migrationBuilder.DeleteData(
                table: "categories",
                keyColumn: "category_id",
                keyValue: 6);

            migrationBuilder.DeleteData(
                table: "categories",
                keyColumn: "category_id",
                keyValue: 7);
        }
    }
}
