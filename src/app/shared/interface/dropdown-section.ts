import { DropdownItem } from "./dropdown-item";

export interface DropdownSection {
    title?: string;
    items: DropdownItem[];
    columns?: number;
}