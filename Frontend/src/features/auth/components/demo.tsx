// src/components/demo.tsx
import { Menu, UnstyledButton } from "@mantine/core";
import { Link } from "react-router-dom";
import { IconChevronDown } from "@tabler/icons-react";

const CATEGORIES = [
  { id: 1, title: "اتاق خواب" },
  { id: 2, title: "پذیرایی" },
  { id: 3, title: "آشپزخانه" },
  { id: 4, title: "اتاق کار" },
  { id: 5, title: "عروسی و نامزدی" },
  { id: 6, title: "جشن تولد" },
  { id: 7, title: "کافی‌ شاپ و رستوران" },
];

function Demo() {
  return (
    <Menu shadow="md" width={220} position="bottom-start" withinPortal={false}>
      <Menu.Target>
        <UnstyledButton className="nav-dropdown-trigger" type="button">
          <span>دسته بندی‌ها</span>
          <IconChevronDown size={16} />
        </UnstyledButton>
      </Menu.Target>

      <Menu.Dropdown dir="rtl">
        <Menu.Label>دسته بندی‌ها</Menu.Label>

        {CATEGORIES.map((c) => (
          <Menu.Item key={c.id} component={Link} to={`/category/${c.id}`}>
            {c.title}
          </Menu.Item>
        ))}
      </Menu.Dropdown>
    </Menu>
  );
}

export default Demo;
