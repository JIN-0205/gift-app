import { Calendar, Home, Inbox, Search, Settings } from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarSeparator,
} from "@/components/ui/sidebar";

// Menu items.
const items = [
  {
    title: "Home",
    url: "#",
    icon: Home,
  },
  {
    title: "Inbox",
    url: "#",
    icon: Inbox,
  },
  {
    title: "Calendar",
    url: "#",
    icon: Calendar,
  },
  {
    title: "Search",
    url: "#",
    icon: Search,
  },
  {
    title: "Settings",
    url: "#",
    icon: Settings,
  },
];

export function ChatSidebar() {
  return (
    <Sidebar
      side="right"
      variant="floating"
      collapsible="icon"
      className="mt-6 hidden md:flex"
    >
      <SidebarHeader className="border-b border-gray-100 px-4 py-4">
        <div>
          <p className="text-base font-semibold text-gray-900">相談サポート</p>
          <p className="text-sm text-gray-500">
            ヒントを参考にしながら、ギフトの相談をスムーズに進めましょう。
          </p>
        </div>
      </SidebarHeader>
      <SidebarContent className="space-y-6 px-4 py-6">
        <SidebarGroup>
          <SidebarGroupLabel>相談をスムーズにするコツ</SidebarGroupLabel>
          <SidebarGroupContent>
            <ul className="space-y-3 rounded-2xl bg-gray-50/80 p-4 text-sm text-gray-700">
              <li>
                ・
                贈りたい相手の属性（年齢・関係性・好み）を添えると精度が上がります。
              </li>
              <li>
                ・
                予算帯や受け渡しシーン（手渡し・配送など）を可能な範囲で共有しましょう。
              </li>
              <li>
                ・
                迷っているポイントを具体的に伝えると、より的確なフォローが届きます。
              </li>
            </ul>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarSeparator />
        <SidebarGroup>
          <SidebarGroupLabel>相談の例</SidebarGroupLabel>
          <SidebarContent className="space-y-6 px-4 py-6">
            <SidebarGroup>
              <SidebarGroupLabel>相談をスムーズにするコツ</SidebarGroupLabel>
              <SidebarGroupContent>
                <ul className="space-y-3 rounded-2xl bg-gray-50/80 p-4 text-sm text-gray-700">
                  <li>
                    ・
                    贈りたい相手の属性（年齢・関係性・好み）を添えると精度が上がります。
                  </li>
                  <li>
                    ・
                    予算帯や受け渡しシーン（手渡し・配送など）を可能な範囲で共有しましょう。
                  </li>
                  <li>
                    ・
                    迷っているポイントを具体的に伝えると、より的確なフォローが届きます。
                  </li>
                </ul>
              </SidebarGroupContent>
            </SidebarGroup>
            <SidebarSeparator />
            <SidebarGroup>
              <SidebarGroupLabel>相談の例</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarGroupContent>
                  <ul className="space-y-3 rounded-2xl bg-gray-50/80 p-4 text-sm text-gray-700">
                    <li>
                      ・
                      贈りたい相手の属性（年齢・関係性・好み）を添えると精度が上がります。
                    </li>
                    <li>
                      ・
                      予算帯や受け渡しシーン（手渡し・配送など）を可能な範囲で共有しましょう。
                    </li>
                    <li>
                      ・
                      迷っているポイントを具体的に伝えると、より的確なフォローが届きます。
                    </li>
                  </ul>
                </SidebarGroupContent>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
