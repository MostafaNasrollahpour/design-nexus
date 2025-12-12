// src/components/demo.tsx
import { Menu, UnstyledButton } from "@mantine/core";
import { Link } from "react-router-dom";
import { IconChevronDown } from "@tabler/icons-react";

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

        <Menu.Item component={Link} to="/hall">
          پذیرایی
        </Menu.Item>

        <Menu.Item component={Link} to="/kitchen">
          آشپزخانه
        </Menu.Item>

        <Menu.Item component={Link} to="/work-room">
          اتاق کار
        </Menu.Item>

        <Menu.Item component={Link} to="/wedding">
          عروسی و نامزدی
        </Menu.Item>

        <Menu.Item component={Link} to="/birthday">
          جشن تولد
        </Menu.Item>

        <Menu.Item component={Link} to="/caffee">
          کافی‌ شاپ و رستوران
        </Menu.Item>

        <Menu.Item component={Link} to="/bedroom">
          اتاق خواب
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
}

export default Demo;
