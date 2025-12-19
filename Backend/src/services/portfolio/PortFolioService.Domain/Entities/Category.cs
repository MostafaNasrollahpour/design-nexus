using System;

namespace PortFolioService.Domain.Entities;

public class Category
{
    public int Id { get; private set; }
    public string Name { get; private set; } = null!;
    public string? Description { get; private set; }

    private Category() { }

    public Category(int id, string name, string? description)
    {
        Id = id;
        Name = name;
        Description = description;
    }
}

