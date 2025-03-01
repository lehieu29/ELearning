export interface DropdownItem {
    label: string;
    href?: string;
    subItems?: DropdownItem[];
}