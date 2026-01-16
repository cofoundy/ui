import type { Meta, StoryObj } from "@storybook/react";
import * as React from "react";
import {
  Archive,
  Calendar,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  File,
  Home,
  Inbox,
  LogOut,
  MoreHorizontal,
  PanelLeftIcon,
  Plus,
  Search,
  Send,
  Settings,
  Sparkles,
  Star,
  Trash2,
  User2,
  Users,
  HelpCircle,
  MessageSquare,
  Bell,
  CreditCard,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInput,
  SidebarInset,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSkeleton,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarRail,
  SidebarSeparator,
  SidebarTrigger,
} from "../../components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../../components/ui/collapsible";
import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/avatar";
import { Logo } from "../../components/ui/logo";
import { Sheet, SheetContent } from "../../components/ui/sheet";
import { Button } from "../../components/ui/button";
import { Separator } from "../../components/ui/separator";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "../../components/ui/breadcrumb";
import { getInitials, truncate } from "../../utils/string";

const meta: Meta<typeof Sidebar> = {
  title: "UI/Sidebar",
  component: Sidebar,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
  },
};

export default meta;
type Story = StoryObj<typeof Sidebar>;

// Navigation items for stories
const navigationItems = [
  { title: "Home", icon: Home, url: "#" },
  { title: "Inbox", icon: Inbox, url: "#", badge: "3" },
  { title: "Calendar", icon: Calendar, url: "#" },
  { title: "Search", icon: Search, url: "#" },
  { title: "Settings", icon: Settings, url: "#" },
];

// Basic sidebar story
export const Default: Story = {
  render: () => (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton size="lg" asChild>
                <a href="#">
                  <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-[var(--sidebar-primary)] text-[var(--sidebar-primary-foreground)]">
                    <Sparkles className="size-4" />
                  </div>
                  <div className="flex flex-col gap-0.5 leading-none">
                    <span className="font-semibold">Acme Inc</span>
                    <span className="text-xs text-[var(--muted-foreground)]">
                      Enterprise
                    </span>
                  </div>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Navigation</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {navigationItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <a href={item.url}>
                        <item.icon />
                        <span>{item.title}</span>
                      </a>
                    </SidebarMenuButton>
                    {item.badge && (
                      <SidebarMenuBadge>{item.badge}</SidebarMenuBadge>
                    )}
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton>
                <User2 />
                <span>John Doe</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="flex h-14 items-center gap-2 border-b border-[var(--border)] px-4">
          <SidebarTrigger className="-ml-1" />
          <span className="font-semibold">Dashboard</span>
        </header>
        <main className="flex-1 p-4">
          <p className="text-[var(--muted-foreground)]">
            Main content area. Use Cmd/Ctrl+B to toggle the sidebar.
          </p>
        </main>
      </SidebarInset>
    </SidebarProvider>
  ),
};

// Collapsed icon mode
export const CollapsedIcon: Story = {
  render: () => (
    <SidebarProvider defaultOpen={false}>
      <Sidebar collapsible="icon">
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton size="lg" tooltip="Acme Inc">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-[var(--sidebar-primary)] text-[var(--sidebar-primary-foreground)]">
                  <Sparkles className="size-4" />
                </div>
                <div className="flex flex-col gap-0.5 leading-none">
                  <span className="font-semibold">Acme Inc</span>
                  <span className="text-xs text-[var(--muted-foreground)]">
                    Enterprise
                  </span>
                </div>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Navigation</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {navigationItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton tooltip={item.title}>
                      <item.icon />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarRail />
      </Sidebar>
      <SidebarInset>
        <header className="flex h-14 items-center gap-2 border-b border-[var(--border)] px-4">
          <SidebarTrigger className="-ml-1" />
          <span className="font-semibold">Collapsed Icon Mode</span>
        </header>
        <main className="flex-1 p-4">
          <p className="text-[var(--muted-foreground)]">
            Sidebar collapses to icons only. Hover over the rail to expand, or use Cmd/Ctrl+B.
          </p>
        </main>
      </SidebarInset>
    </SidebarProvider>
  ),
};

// Right side sidebar
export const RightSide: Story = {
  render: () => (
    <SidebarProvider>
      <SidebarInset>
        <header className="flex h-14 items-center justify-between border-b border-[var(--border)] px-4">
          <span className="font-semibold">Right Side Sidebar</span>
          <SidebarTrigger />
        </header>
        <main className="flex-1 p-4">
          <p className="text-[var(--muted-foreground)]">
            The sidebar is positioned on the right side.
          </p>
        </main>
      </SidebarInset>
      <Sidebar side="right">
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton size="lg">
                <Settings className="size-4" />
                <span className="font-semibold">Settings Panel</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Options</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton>
                    <User2 />
                    <span>Profile</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton>
                    <Bell />
                    <span>Notifications</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton>
                    <CreditCard />
                    <span>Billing</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
    </SidebarProvider>
  ),
};

// Floating variant
export const FloatingVariant: Story = {
  render: () => (
    <SidebarProvider>
      <Sidebar variant="floating">
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton size="lg">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-[var(--sidebar-primary)] text-[var(--sidebar-primary-foreground)]">
                  <Sparkles className="size-4" />
                </div>
                <div className="flex flex-col gap-0.5 leading-none">
                  <span className="font-semibold">Floating</span>
                  <span className="text-xs text-[var(--muted-foreground)]">
                    Variant
                  </span>
                </div>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Navigation</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {navigationItems.slice(0, 3).map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton>
                      <item.icon />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
      <SidebarInset>
        <header className="flex h-14 items-center gap-2 border-b border-[var(--border)] px-4">
          <SidebarTrigger className="-ml-1" />
          <span className="font-semibold">Floating Variant</span>
        </header>
        <main className="flex-1 p-4">
          <p className="text-[var(--muted-foreground)]">
            The sidebar floats with rounded corners and a shadow.
          </p>
        </main>
      </SidebarInset>
    </SidebarProvider>
  ),
};

// Inset variant
export const InsetVariant: Story = {
  render: () => (
    <SidebarProvider>
      <Sidebar variant="inset">
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton size="lg">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-[var(--sidebar-primary)] text-[var(--sidebar-primary-foreground)]">
                  <Sparkles className="size-4" />
                </div>
                <div className="flex flex-col gap-0.5 leading-none">
                  <span className="font-semibold">Inset</span>
                  <span className="text-xs text-[var(--muted-foreground)]">
                    Variant
                  </span>
                </div>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Navigation</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {navigationItems.slice(0, 3).map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton>
                      <item.icon />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
      <SidebarInset>
        <header className="flex h-14 items-center gap-2 border-b border-[var(--border)] px-4">
          <SidebarTrigger className="-ml-1" />
          <span className="font-semibold">Inset Variant</span>
        </header>
        <main className="flex-1 p-4">
          <p className="text-[var(--muted-foreground)]">
            The content area is inset with rounded corners.
          </p>
        </main>
      </SidebarInset>
    </SidebarProvider>
  ),
};

// With nested menus (collapsible groups)
export const WithNestedMenus: Story = {
  render: () => {
    const projects = [
      { name: "Design System", icon: Sparkles },
      { name: "Marketing", icon: MessageSquare },
      { name: "Engineering", icon: Settings },
    ];

    return (
      <SidebarProvider>
        <Sidebar>
          <SidebarHeader>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton size="lg">
                  <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-[var(--sidebar-primary)] text-[var(--sidebar-primary-foreground)]">
                    <Sparkles className="size-4" />
                  </div>
                  <div className="flex flex-col gap-0.5 leading-none">
                    <span className="font-semibold">Acme Inc</span>
                    <span className="text-xs text-[var(--muted-foreground)]">
                      Enterprise
                    </span>
                  </div>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Platform</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {navigationItems.slice(0, 3).map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton>
                        <item.icon />
                        <span>{item.title}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            <SidebarGroup>
              <SidebarGroupLabel>Projects</SidebarGroupLabel>
              <SidebarGroupAction title="Add Project">
                <Plus /> <span className="sr-only">Add Project</span>
              </SidebarGroupAction>
              <SidebarGroupContent>
                <SidebarMenu>
                  {projects.map((project) => (
                    <Collapsible
                      key={project.name}
                      asChild
                      defaultOpen={project.name === "Design System"}
                    >
                      <SidebarMenuItem>
                        <SidebarMenuButton asChild>
                          <a href="#">
                            <project.icon />
                            <span>{project.name}</span>
                          </a>
                        </SidebarMenuButton>
                        <CollapsibleTrigger asChild>
                          <SidebarMenuAction className="data-[state=open]:rotate-90">
                            <ChevronRight />
                            <span className="sr-only">Toggle</span>
                          </SidebarMenuAction>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <SidebarMenuSub>
                            <SidebarMenuSubItem>
                              <SidebarMenuSubButton asChild>
                                <a href="#">Overview</a>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                            <SidebarMenuSubItem>
                              <SidebarMenuSubButton asChild>
                                <a href="#">Tasks</a>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                            <SidebarMenuSubItem>
                              <SidebarMenuSubButton asChild>
                                <a href="#">Settings</a>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          </SidebarMenuSub>
                        </CollapsibleContent>
                      </SidebarMenuItem>
                    </Collapsible>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>
        <SidebarInset>
          <header className="flex h-14 items-center gap-2 border-b border-[var(--border)] px-4">
            <SidebarTrigger className="-ml-1" />
            <span className="font-semibold">Nested Menus</span>
          </header>
          <main className="flex-1 p-4">
            <p className="text-[var(--muted-foreground)]">
              Click the chevron icons to expand/collapse project submenus.
            </p>
          </main>
        </SidebarInset>
      </SidebarProvider>
    );
  },
};

// With user dropdown
export const WithUserDropdown: Story = {
  render: () => (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton size="lg">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-[var(--sidebar-primary)] text-[var(--sidebar-primary-foreground)]">
                  <Sparkles className="size-4" />
                </div>
                <div className="flex flex-col gap-0.5 leading-none">
                  <span className="font-semibold">Acme Inc</span>
                  <span className="text-xs text-[var(--muted-foreground)]">
                    Enterprise
                  </span>
                </div>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Navigation</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {navigationItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton>
                      <item.icon />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuButton
                    size="lg"
                    className="data-[state=open]:bg-[var(--sidebar-accent)] data-[state=open]:text-[var(--sidebar-accent-foreground)]"
                  >
                    <Avatar className="size-8 rounded-lg">
                      <AvatarImage src="https://github.com/shadcn.png" alt="Avatar" />
                      <AvatarFallback className="rounded-lg">JD</AvatarFallback>
                    </Avatar>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-semibold">John Doe</span>
                      <span className="truncate text-xs text-[var(--muted-foreground)]">
                        john@example.com
                      </span>
                    </div>
                    <ChevronUp className="ml-auto size-4" />
                  </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                  side="bottom"
                  align="end"
                  sideOffset={4}
                >
                  <DropdownMenuLabel className="p-0 font-normal">
                    <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                      <Avatar className="size-8 rounded-lg">
                        <AvatarImage src="https://github.com/shadcn.png" alt="Avatar" />
                        <AvatarFallback className="rounded-lg">JD</AvatarFallback>
                      </Avatar>
                      <div className="grid flex-1 text-left text-sm leading-tight">
                        <span className="truncate font-semibold">John Doe</span>
                        <span className="truncate text-xs text-[var(--muted-foreground)]">
                          john@example.com
                        </span>
                      </div>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                    <DropdownMenuItem>
                      <Sparkles className="mr-2 size-4" />
                      Upgrade to Pro
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                    <DropdownMenuItem>
                      <User2 className="mr-2 size-4" />
                      Account
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <CreditCard className="mr-2 size-4" />
                      Billing
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Bell className="mr-2 size-4" />
                      Notifications
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <LogOut className="mr-2 size-4" />
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="flex h-14 items-center gap-2 border-b border-[var(--border)] px-4">
          <SidebarTrigger className="-ml-1" />
          <span className="font-semibold">User Dropdown</span>
        </header>
        <main className="flex-1 p-4">
          <p className="text-[var(--muted-foreground)]">
            Click on the user profile in the footer to see the dropdown menu.
          </p>
        </main>
      </SidebarInset>
    </SidebarProvider>
  ),
};

// With badges
export const WithBadges: Story = {
  render: () => (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton size="lg">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-[var(--sidebar-primary)] text-[var(--sidebar-primary-foreground)]">
                  <Sparkles className="size-4" />
                </div>
                <div className="flex flex-col gap-0.5 leading-none">
                  <span className="font-semibold">Acme Inc</span>
                  <span className="text-xs text-[var(--muted-foreground)]">
                    Enterprise
                  </span>
                </div>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Navigation</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton>
                    <Home />
                    <span>Home</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton>
                    <Inbox />
                    <span>Inbox</span>
                  </SidebarMenuButton>
                  <SidebarMenuBadge>24</SidebarMenuBadge>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton>
                    <Bell />
                    <span>Notifications</span>
                  </SidebarMenuButton>
                  <SidebarMenuBadge>3</SidebarMenuBadge>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton>
                    <MessageSquare />
                    <span>Messages</span>
                  </SidebarMenuButton>
                  <SidebarMenuBadge>99+</SidebarMenuBadge>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
      <SidebarInset>
        <header className="flex h-14 items-center gap-2 border-b border-[var(--border)] px-4">
          <SidebarTrigger className="-ml-1" />
          <span className="font-semibold">With Badges</span>
        </header>
        <main className="flex-1 p-4">
          <p className="text-[var(--muted-foreground)]">
            Menu items can display badges for notifications or counts.
          </p>
        </main>
      </SidebarInset>
    </SidebarProvider>
  ),
};

// Loading state with skeletons
export const LoadingState: Story = {
  render: () => (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuSkeleton showIcon />
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Loading...</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {Array.from({ length: 5 }).map((_, i) => (
                  <SidebarMenuItem key={i}>
                    <SidebarMenuSkeleton showIcon />
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
      <SidebarInset>
        <header className="flex h-14 items-center gap-2 border-b border-[var(--border)] px-4">
          <SidebarTrigger className="-ml-1" />
          <span className="font-semibold">Loading State</span>
        </header>
        <main className="flex-1 p-4">
          <p className="text-[var(--muted-foreground)]">
            Use SidebarMenuSkeleton for loading states.
          </p>
        </main>
      </SidebarInset>
    </SidebarProvider>
  ),
};

// With search input
export const WithSearch: Story = {
  render: () => (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton size="lg">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-[var(--sidebar-primary)] text-[var(--sidebar-primary-foreground)]">
                  <Sparkles className="size-4" />
                </div>
                <div className="flex flex-col gap-0.5 leading-none">
                  <span className="font-semibold">Acme Inc</span>
                  <span className="text-xs text-[var(--muted-foreground)]">
                    Enterprise
                  </span>
                </div>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
          <SidebarInput placeholder="Search..." />
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Navigation</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {navigationItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton>
                      <item.icon />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
      <SidebarInset>
        <header className="flex h-14 items-center gap-2 border-b border-[var(--border)] px-4">
          <SidebarTrigger className="-ml-1" />
          <span className="font-semibold">With Search</span>
        </header>
        <main className="flex-1 p-4">
          <p className="text-[var(--muted-foreground)]">
            Search input in the sidebar header.
          </p>
        </main>
      </SidebarInset>
    </SidebarProvider>
  ),
};

// Cofoundy branded demo
export const CofoundyAppSidebar: Story = {
  render: () => {
    const products = [
      { name: "InboxAI", icon: Inbox, description: "Omnichannel inbox" },
      { name: "TimelyAI", icon: Calendar, description: "Scheduling assistant" },
      { name: "PulseAI", icon: MessageSquare, description: "Voice agent" },
      { name: "Transcript", icon: Sparkles, description: "Call intelligence" },
    ];

    const mainNav = [
      { title: "Dashboard", icon: Home, url: "#", isActive: true },
      { title: "Conversations", icon: MessageSquare, url: "#", badge: "12" },
      { title: "Contacts", icon: Users, url: "#" },
      { title: "Analytics", icon: Sparkles, url: "#" },
    ];

    return (
      <SidebarProvider>
        <Sidebar>
          <SidebarHeader>
            <SidebarMenu>
              <SidebarMenuItem>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <SidebarMenuButton
                      size="lg"
                      className="data-[state=open]:bg-[var(--sidebar-accent)] data-[state=open]:text-[var(--sidebar-accent-foreground)]"
                    >
                      <div className="flex aspect-square size-8 items-center justify-center">
                        <Logo size="sm" />
                      </div>
                      <div className="grid flex-1 text-left text-sm leading-tight">
                        <span className="truncate font-semibold">Cofoundy</span>
                        <span className="truncate text-xs text-[var(--muted-foreground)]">
                          InboxAI
                        </span>
                      </div>
                      <ChevronDown className="ml-auto" />
                    </SidebarMenuButton>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                    align="start"
                    side="bottom"
                    sideOffset={4}
                  >
                    <DropdownMenuLabel className="text-xs text-[var(--muted-foreground)]">
                      Products
                    </DropdownMenuLabel>
                    {products.map((product) => (
                      <DropdownMenuItem key={product.name} className="gap-2 p-2">
                        <div className="flex size-6 items-center justify-center rounded-sm border border-[var(--border)]">
                          <product.icon className="size-4 shrink-0" />
                        </div>
                        <div className="flex flex-col">
                          <span className="font-medium">{product.name}</span>
                          <span className="text-xs text-[var(--muted-foreground)]">
                            {product.description}
                          </span>
                        </div>
                      </DropdownMenuItem>
                    ))}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="gap-2 p-2">
                      <div className="flex size-6 items-center justify-center rounded-md border border-[var(--border)] bg-[var(--background)]">
                        <Plus className="size-4" />
                      </div>
                      <span className="text-[var(--muted-foreground)]">
                        Add product
                      </span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Main</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {mainNav.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild isActive={item.isActive}>
                        <a href={item.url}>
                          <item.icon />
                          <span>{item.title}</span>
                        </a>
                      </SidebarMenuButton>
                      {item.badge && (
                        <SidebarMenuBadge>{item.badge}</SidebarMenuBadge>
                      )}
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
            <SidebarSeparator />
            <SidebarGroup>
              <SidebarGroupLabel>Support</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton>
                      <HelpCircle />
                      <span>Help Center</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton>
                      <Settings />
                      <span>Settings</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
          <SidebarFooter>
            <SidebarMenu>
              <SidebarMenuItem>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <SidebarMenuButton
                      size="lg"
                      className="data-[state=open]:bg-[var(--sidebar-accent)] data-[state=open]:text-[var(--sidebar-accent-foreground)]"
                    >
                      <Avatar className="size-8 rounded-lg">
                        <AvatarFallback className="rounded-lg bg-[var(--primary)] text-[var(--primary-foreground)]">
                          AP
                        </AvatarFallback>
                      </Avatar>
                      <div className="grid flex-1 text-left text-sm leading-tight">
                        <span className="truncate font-semibold">Andre Pacheco</span>
                        <span className="truncate text-xs text-[var(--muted-foreground)]">
                          andre@cofoundy.com
                        </span>
                      </div>
                      <ChevronUp className="ml-auto size-4" />
                    </SidebarMenuButton>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                    side="bottom"
                    align="end"
                    sideOffset={4}
                  >
                    <DropdownMenuLabel className="p-0 font-normal">
                      <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                        <Avatar className="size-8 rounded-lg">
                          <AvatarFallback className="rounded-lg bg-[var(--primary)] text-[var(--primary-foreground)]">
                            AP
                          </AvatarFallback>
                        </Avatar>
                        <div className="grid flex-1 text-left text-sm leading-tight">
                          <span className="truncate font-semibold">Andre Pacheco</span>
                          <span className="truncate text-xs text-[var(--muted-foreground)]">
                            andre@cofoundy.com
                          </span>
                        </div>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuGroup>
                      <DropdownMenuItem>
                        <User2 className="mr-2 size-4" />
                        Account
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <CreditCard className="mr-2 size-4" />
                        Billing
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Bell className="mr-2 size-4" />
                        Notifications
                      </DropdownMenuItem>
                    </DropdownMenuGroup>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      <LogOut className="mr-2 size-4" />
                      Log out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
          <SidebarRail />
        </Sidebar>
        <SidebarInset>
          <header className="flex h-14 items-center gap-2 border-b border-[var(--border)] px-4">
            <SidebarTrigger className="-ml-1" />
            <SidebarSeparator orientation="vertical" className="mr-2 h-4" />
            <span className="font-semibold">Dashboard</span>
          </header>
          <main className="flex-1 p-6">
            <div className="rounded-lg border border-[var(--border)] p-6">
              <h2 className="text-lg font-semibold mb-2">Welcome to InboxAI</h2>
              <p className="text-[var(--muted-foreground)]">
                This is a demo of the Cofoundy sidebar component. It includes product
                switching, navigation items with badges, and a user dropdown menu.
              </p>
              <div className="mt-4 text-sm text-[var(--muted-foreground)]">
                <p>Try these features:</p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>Press <kbd className="px-1.5 py-0.5 text-xs rounded bg-[var(--accent)]">Cmd/Ctrl+B</kbd> to toggle the sidebar</li>
                  <li>Click the workspace dropdown to switch products</li>
                  <li>Click the user avatar to access account settings</li>
                  <li>Hover over the rail to expand the sidebar</li>
                </ul>
              </div>
            </div>
          </main>
        </SidebarInset>
      </SidebarProvider>
    );
  },
};

// InboxAI Dual Sidebar Pattern
// Icon sidebar + Inbox list + Main content
export const InboxAISidebar: Story = {
  render: () => {
    const [selectedMail, setSelectedMail] = React.useState(0);
    const [mobileOpen, setMobileOpen] = React.useState(false);

    const navItems = [
      { title: "Inbox", icon: Inbox, badge: "12" },
      { title: "Drafts", icon: File },
      { title: "Sent", icon: Send },
      { title: "Starred", icon: Star },
      { title: "Archive", icon: Archive },
      { title: "Trash", icon: Trash2 },
    ];

    const mails = [
      {
        id: 1,
        name: "William Smith",
        email: "williamsmith@example.com",
        subject: "Meeting Tomorrow",
        preview: "Hi, let's have a meeting tomorrow to discuss the project. I've been reviewing the project details and have some thoughts to share.",
        date: "09:34 AM",
        unread: true,
        labels: ["meeting", "work"],
      },
      {
        id: 2,
        name: "Alice Smith",
        email: "alicesmith@example.com",
        subject: "Re: Project Update",
        preview: "Thank you for the update. The progress looks great, and I'm impressed with the results so far. Keep up the good work!",
        date: "Yesterday",
        unread: true,
        labels: ["work", "important"],
      },
      {
        id: 3,
        name: "Bob Johnson",
        email: "bobjohnson@example.com",
        subject: "Weekend Plans",
        preview: "Hey, any plans for the weekend? I was thinking we could catch up over coffee. Let me know if you're free!",
        date: "2 days ago",
        unread: false,
        labels: ["personal"],
      },
      {
        id: 4,
        name: "Emily Davis",
        email: "emilydavis@example.com",
        subject: "Re: Question about Budget",
        preview: "I've reviewed the budget proposal you sent over. I have a few questions about the allocation for Q2. Can we schedule a call?",
        date: "2 days ago",
        unread: false,
        labels: ["work", "budget"],
      },
      {
        id: 5,
        name: "Michael Wilson",
        email: "michaelwilson@example.com",
        subject: "Documentation Request",
        preview: "Could you please send me the latest documentation for the new feature? I need it for the client presentation next week.",
        date: "1 week ago",
        unread: false,
        labels: ["work"],
      },
    ];

    // Reusable mail list content
    const MailList = ({ onSelect }: { onSelect?: () => void }) => (
      <>
        <div className="flex flex-col gap-3.5 border-b border-[var(--border)] p-4 bg-[var(--sidebar-background)]">
          <div className="flex w-full items-center justify-between">
            <span className="text-base font-medium text-[var(--foreground)]">
              Inbox
            </span>
            <span className="text-xs font-medium tabular-nums text-[var(--muted-foreground)]">
              {mails.filter((m) => m.unread).length} unread
            </span>
          </div>
          <SidebarInput placeholder="Search mail..." />
        </div>
        <div className="flex-1 overflow-auto bg-[var(--sidebar-background)]">
          {mails.map((mail, index) => (
            <button
              key={mail.id}
              onClick={() => {
                setSelectedMail(index);
                onSelect?.();
              }}
              className={`flex w-full flex-col items-start gap-2 whitespace-nowrap border-b border-[var(--border)] p-4 text-sm leading-tight last:border-b-0 hover:bg-[var(--sidebar-accent)] hover:text-[var(--sidebar-accent-foreground)] ${
                selectedMail === index
                  ? "bg-[var(--sidebar-accent)] text-[var(--sidebar-accent-foreground)]"
                  : ""
              }`}
            >
              <div className="flex w-full items-center gap-2">
                <Avatar className="size-7 shrink-0">
                  <AvatarFallback className="text-xs">
                    {getInitials(mail.name)}
                  </AvatarFallback>
                </Avatar>
                <span className={mail.unread ? "font-medium" : ""}>
                  {mail.name}
                </span>
                <span className="ml-auto text-xs text-[var(--muted-foreground)]">
                  {mail.date}
                </span>
              </div>
              <span className={`w-full truncate text-left ${mail.unread ? "font-medium" : ""}`}>
                {mail.subject}
              </span>
              <span className="line-clamp-2 w-full whitespace-break-spaces text-left text-xs text-[var(--muted-foreground)]">
                {truncate(mail.preview, 90)}
              </span>
            </button>
          ))}
        </div>
      </>
    );

    return (
      <SidebarProvider>
        {/* Icon Sidebar */}
        <Sidebar
          collapsible="none"
          className="!w-[calc(var(--sidebar-width-icon)+1px)] border-r border-[var(--border)]"
        >
          <SidebarHeader>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton size="lg" className="md:h-8 md:p-0">
                  <div className="flex aspect-square size-8 items-center justify-center">
                    <Logo size="sm" />
                  </div>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupContent className="px-1.5 md:px-0">
                <SidebarMenu>
                  {navItems.map((item, index) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        tooltip={{
                          children: item.title,
                          hidden: false,
                        }}
                        isActive={index === 0}
                        className="px-2.5 md:px-2"
                      >
                        <item.icon />
                        <span>{item.title}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
          <SidebarFooter>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  tooltip={{
                    children: "Settings",
                    hidden: false,
                  }}
                  className="px-2.5 md:px-2"
                >
                  <Settings />
                  <span>Settings</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
        </Sidebar>

        {/* Inbox List - Desktop: static aside, Mobile: Sheet */}
        <aside className="hidden w-72 flex-col border-r border-[var(--border)] md:flex">
          <MailList />
        </aside>

        {/* Mobile Sheet for inbox list */}
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetContent side="left" className="w-72 p-0 [&>button]:hidden">
            <div className="flex h-full flex-col">
              <MailList onSelect={() => setMobileOpen(false)} />
            </div>
          </SheetContent>
        </Sheet>

        {/* Main Content */}
        <main className="flex flex-1 flex-col bg-[var(--background)]">
          <header className="flex h-14 shrink-0 items-center gap-2 border-b border-[var(--border)] px-4">
            <Button
              variant="ghost"
              size="icon"
              className="-ml-1 size-7 md:hidden"
              onClick={() => setMobileOpen(true)}
            >
              <PanelLeftIcon className="size-4" />
              <span className="sr-only">Open inbox</span>
            </Button>
            <Separator orientation="vertical" className="mr-2 h-4 md:hidden" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="#">All Inboxes</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>Inbox</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </header>
          <div className="flex flex-1 flex-col gap-4 p-4">
            <div className="flex items-start gap-4 text-sm">
              <Avatar className="size-10">
                <AvatarFallback>
                  {getInitials(mails[selectedMail].name)}
                </AvatarFallback>
              </Avatar>
              <div className="grid gap-1">
                <div className="font-semibold">{mails[selectedMail].name}</div>
                <div className="line-clamp-1 text-xs text-[var(--muted-foreground)]">
                  {mails[selectedMail].email}
                </div>
                <div className="text-xs font-medium">{mails[selectedMail].subject}</div>
              </div>
              <div className="ml-auto text-xs text-[var(--muted-foreground)]">
                {mails[selectedMail].date}
              </div>
            </div>
            <Separator />
            <div className="flex-1 whitespace-pre-wrap text-sm text-[var(--muted-foreground)]">
              {mails[selectedMail].preview}
            </div>
          </div>
        </main>
      </SidebarProvider>
    );
  },
};
