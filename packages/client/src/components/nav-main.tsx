import { type LucideIcon } from "lucide-react";

import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { NavLink } from "react-router-dom";

export function NavMain({
  items,
}: {
  items: {
    title: string;
    url: string;
    icon?: LucideIcon;
    items?: {
      title: string;
      url: string;
    }[];
  }[];
}) {
  const { state } = useSidebar();

  return (
    <SidebarGroup>
      <SidebarMenu>
        {items.map((item) => (
          <SidebarMenuItem key={item.title}>
            <Tooltip>
              <TooltipTrigger asChild>
                <NavLink
                  to={item.url}
                  end={item.url === "/" || item.url === "/market"}
                >
                  {({ isActive }) => (
                    <SidebarMenuButton isActive={isActive} size="lg">
                      {item.icon && (
                        <item.icon
                          className={`size-6! transition-all ${state === "collapsed" ? "ml-1" : ""}`}
                        />
                      )}

                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  )}
                </NavLink>
              </TooltipTrigger>

              <TooltipContent
                side="right"
                className={state === "collapsed" ? "" : "hidden"}
              >
                <p>{item.title}</p>
              </TooltipContent>
            </Tooltip>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}
