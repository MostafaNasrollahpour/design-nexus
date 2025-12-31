import { Menu, UnstyledButton } from "@mantine/core";
import { IconChevronDown } from "@tabler/icons-react";

export type Category = {
  id: number;
  title: string;
};

const CATEGORIES: Category[] = [
  { id: 1, title: "اتاق خواب" },
  { id: 2, title: "پذیرایی" },
  { id: 3, title: "آشپزخانه" },
  { id: 4, title: "اتاق کار" },
  { id: 5, title: "عروسی و نامزدی" },
  { id: 6, title: "جشن تولد" },
  { id: 7, title: "کافی‌ شاپ و رستوران" },
];

type Props = {
  value: number | null;
  onChange: (id: number) => void;
};

export default function CategoryDropdown({ value, onChange }: Props) {
  const selected = CATEGORIES.find(c => c.id === value);

  return (
    <Menu shadow="md" width={220} position="bottom-start" withinPortal={false}>
      <Menu.Target>
        <UnstyledButton className="portfolioEdit-input" type="button">
          <span>{selected?.title || "انتخاب دسته بندی"}</span>
          <IconChevronDown size={16} />
        </UnstyledButton>
      </Menu.Target>

      <Menu.Dropdown dir="rtl">
        <Menu.Label>دسته بندی‌ها</Menu.Label>

        {CATEGORIES.map(c => (
          <Menu.Item
            key={c.id}
            onClick={() => onChange(c.id)}
          >
            {c.title}
          </Menu.Item>
        ))}
      </Menu.Dropdown>
    </Menu>
  );
}
