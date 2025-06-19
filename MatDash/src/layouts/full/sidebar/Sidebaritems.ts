export interface ChildItem {
  id?: number | string;
  name?: string;
  icon?: any;
  children?: ChildItem[];
  item?: any;
  url?: any;
  color?: string;
}

export interface MenuItem {
  heading?: string;
  name?: string;
  icon?: any;
  id?: number;
  to?: string;
  items?: MenuItem[];
  children?: ChildItem[];
  url?: any;
}

import { uniqueId } from "lodash";

const SidebarContent: MenuItem[] = [
  {
    heading: "HOME",
    children: [
      {
        name: "Dashboard",
        icon: "solar:widget-add-line-duotone",
        id: uniqueId(),
        url: "/",
      },
    ],
  },
  {
    heading: "UTILITIES",
    children: [
      {
        name: "Admission",
        icon: "solar-notebook-outline",
        id: uniqueId(),
        url: "/ui/studentform",
      },
      {
        name: "Table",
        icon: "solar:bedside-table-3-linear",
        id: uniqueId(),
        url: "/ui/table",
      },

      {
        name: "Fees Form",
        icon: "solar-notebook-outline",
        id: uniqueId(),
        url: "/ui/feesform",
      },
     {
        name: "Fees",
        icon: "solar:bedside-table-3-linear",
        id: uniqueId(),
        url: "/ui/feestable",
      },
     {
        name: "Course",
        icon: "solar-notebook-outline",
        id: uniqueId(),
        url: "/ui/course",
      },
        {
        name: "Batch",
        icon: "solar-notebook-outline",
        id:  uniqueId(),
        url : "/ui/batch",
      }
    ],
  },
  // {
  //   heading: "AUTH",
  //   children: [
  //     {
  //       name: "Logout",
  //       icon: "solar:login-2-linear",
  //       id: uniqueId(),
  //       url: "/auth/logout",
  //     },

  //   ],
  // },

];

export default SidebarContent;
