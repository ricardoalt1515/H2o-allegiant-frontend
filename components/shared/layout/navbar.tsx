"use client";

import {
	Droplets,
	FileText,
	FolderOpen,
	Home,
	LogOut,
	Menu,
	Plus,
	Search,
	Settings,
	User,
	Zap,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { PremiumProjectWizard } from "@/components/features/dashboard";
import { ThemeToggle } from "@/components/shared/common/theme-toggle";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import {
	CommandDialog,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from "@/components/ui/command";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/lib/contexts";
import { routes } from "@/lib/routes";
import {
	useEnsureProjectsLoaded,
	useProjectLoading,
	useProjectStore,
	useProjects,
} from "@/lib/stores";
import { useProposalGenerationStore } from "@/lib/stores/proposal-generation-store";
import { cn } from "@/lib/utils";
import { ProposalProgressBadge } from "./proposal-progress-badge";

// Navigation config - inline (DRY: only used here, no duplication)
const PRIMARY_NAV_LINKS = [
	{
		name: "Dashboard",
		href: "/dashboard",
		icon: Home,
		description: "View projects",
	},
];

const QUICK_ACTIONS = [
	{
		name: "Create New Project",
		href: "/dashboard",
		icon: Zap,
		description: "Start new project",
	},
	{
		name: "Search Projects",
		href: "/dashboard",
		icon: FolderOpen,
		description: "Find projects",
	},
	{
		name: "Settings",
		href: "/dashboard",
		icon: Settings,
		description: "Configure app",
	},
];

export function NavBar() {
	const [searchOpen, setSearchOpen] = useState(false);
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
	const [createModalOpen, setCreateModalOpen] = useState(false);
	const pathname = usePathname();
	const router = useRouter();
	const projects = useProjects();
	const loadingProjects = useProjectLoading();
	useEnsureProjectsLoaded();
	const { user, logout } = useAuth();

	// Proposal generation progress
	const { isGenerating, progress, currentStep, estimatedTime } =
		useProposalGenerationStore();

	// Get user initials for avatar
	const getUserInitials = () => {
		if (!user) return "?";
		const names = user.name.split(" ").filter((n) => n.length > 0);
		if (names.length >= 2) {
			const first = names[0]?.[0] ?? "";
			const last = names[names.length - 1]?.[0] ?? "";
			return (first + last).toUpperCase();
		}
		return user.name.substring(0, 2).toUpperCase();
	};

	useEffect(() => {
		const onKeyDown = (event: KeyboardEvent) => {
			if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
				event.preventDefault();
				setSearchOpen((open) => !open);
			}
		};

		window.addEventListener("keydown", onKeyDown);
		return () => window.removeEventListener("keydown", onKeyDown);
	}, []);

	return (
		<>
			<nav className="glass-nav sticky top-0 z-50 w-full">
				<div className="mx-auto flex h-[4.25rem] w-full max-w-6xl items-center justify-between gap-6 px-4 md:px-6">
					<div className="flex items-center gap-4 md:gap-6">
						<Link href="/dashboard" className="flex items-center gap-2">
							<div className="glass-card flex h-10 w-10 items-center justify-center rounded-xl bg-primary/90 text-primary-foreground shadow-water hover:shadow-water-lg transition-all duration-300 hover:-translate-y-0.5">
								<Droplets className="h-5 w-5" />
							</div>
							<span className="hidden font-serif text-xl font-semibold tracking-tight md:inline-block text-gradient">
								H2O Allegiant
							</span>
						</Link>

						<div className="hidden items-center gap-2 rounded-full border border-white/15 bg-white/10 px-2 py-1 backdrop-blur-xl shadow-md md:flex dark:border-white/5 dark:bg-slate-900/30">
							{PRIMARY_NAV_LINKS.map((link) => {
								const Icon = link.icon;
								const isActive = pathname?.startsWith(link.href);
								return (
									<Link
										key={link.name}
										href={link.href}
										suppressHydrationWarning
										className={cn(
											"inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium text-muted-foreground transition-all duration-300 hover:bg-primary/15 hover:text-primary",
											isActive && "aqua-floating-chip",
										)}
									>
										<Icon className="h-4 w-4" />
										<span>{link.name}</span>
									</Link>
								);
							})}
						</div>
					</div>

					<div className="flex items-center gap-2">
						{/* Proposal generation progress badge */}
						<ProposalProgressBadge
							progress={progress}
							isVisible={isGenerating}
							currentStep={currentStep}
							estimatedTime={estimatedTime}
						/>

						<Button
							variant="ghost"
							size="sm"
							className="hidden h-9 rounded-full bg-white/20 px-2 py-0.5 text-[11px] font-semibold text-muted-foreground/80 lg:inline-flex"
							onClick={() => setSearchOpen(true)}
						>
							<Search className="mr-2 h-4 w-4" />
							Search
							<span className="ml-2 hidden rounded-full bg-white/20 px-2 py-0.5 text-[11px] font-semibold text-muted-foreground/80 lg:block">
								⌘K
							</span>
						</Button>

						<ThemeToggle />
						<Button
							variant="ghost"
							size="icon"
							className="inline-flex h-9 w-9 rounded-full border border-white/20 bg-white/10 text-foreground transition-all duration-300 hover:bg-white/20 md:hidden"
							onClick={() => setSearchOpen(true)}
						>
							<Search className="h-4 w-4" />
							<span className="sr-only">Open search</span>
						</Button>

						<button
							className={cn(
								buttonVariants({ size: "sm" }),
								"hidden rounded-full px-4 lg:inline-flex bg-gradient-to-r from-blue-500/90 to-blue-600/90 text-white shadow-water hover:shadow-water-lg transition-all duration-300",
							)}
							onClick={() => setCreateModalOpen(true)}
							type="button"
						>
							<Plus className="mr-2 h-4 w-4" />
							New Project
						</button>

						{user && (
							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<button
										type="button"
										aria-label="Open user menu"
										className={cn(
											buttonVariants({ variant: "ghost", size: "icon" }),
											"relative h-9 w-9 rounded-full p-0 bg-white/5 text-foreground hover:bg-white/10 transition-all duration-300",
										)}
									>
										<Avatar className="h-9 w-9 border border-white/10 bg-white/10 backdrop-blur">
											<AvatarFallback className="bg-primary/10 text-sm font-medium text-primary">
												{getUserInitials()}
											</AvatarFallback>
										</Avatar>
									</button>
								</DropdownMenuTrigger>
								<DropdownMenuContent className="w-56" align="end" forceMount>
									<DropdownMenuLabel className="font-normal">
										<div className="flex flex-col space-y-1">
											<p className="text-sm font-medium leading-none">
												{user.name}
											</p>
											<p className="text-xs leading-none text-muted-foreground">
												{user.email}
											</p>
											{user.company && (
												<p className="text-xs leading-none text-muted-foreground">
													{user.company}
												</p>
											)}
										</div>
									</DropdownMenuLabel>
									<DropdownMenuSeparator />
									<DropdownMenuItem>
										<User className="mr-2 h-4 w-4" />
										<span>Profile</span>
									</DropdownMenuItem>
									<DropdownMenuItem>
										<Settings className="mr-2 h-4 w-4" />
										<span>Settings</span>
									</DropdownMenuItem>
									<DropdownMenuSeparator />
									<DropdownMenuItem
										onClick={logout}
										className="text-destructive focus:text-destructive"
									>
										<LogOut className="mr-2 h-4 w-4" />
										<span>Sign Out</span>
									</DropdownMenuItem>
								</DropdownMenuContent>
							</DropdownMenu>
						)}

						<Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
							<SheetTrigger asChild>
								<button
									type="button"
									aria-label="Open menu"
									className={cn(
										buttonVariants({ variant: "ghost", size: "icon" }),
										"ml-1 px-0 text-base bg-white/10 text-foreground hover:bg-white/20 focus:bg-white/10 md:hidden",
									)}
								>
									<Menu className="h-6 w-6" />
									<span className="sr-only">Open menu</span>
								</button>
							</SheetTrigger>
							<SheetContent side="left" className="glass-card pr-0">
								<SheetHeader>
									<SheetTitle className="flex items-center">
										<div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/90 text-primary-foreground shadow-md">
											<Droplets className="h-4 w-4" />
										</div>
										<span className="ml-2 font-serif text-lg text-gradient">
											H2O Allegiant
										</span>
									</SheetTitle>
									<SheetDescription>
										Water Treatment Engineering
									</SheetDescription>
								</SheetHeader>
								<div className="my-6 flex flex-col space-y-4 pl-1">
									{PRIMARY_NAV_LINKS.map((link) => {
										const Icon = link.icon;
										const isActive = pathname?.startsWith(link.href);
										return (
											<Link
												key={link.name}
												href={link.href}
												className={cn(
													"flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium text-muted-foreground transition hover:bg-white/10 hover:text-foreground",
													isActive && "aqua-floating-chip",
												)}
												onClick={() => setMobileMenuOpen(false)}
											>
												<Icon className="h-4 w-4" />
												<span>{link.name}</span>
											</Link>
										);
									})}
								</div>
								<div className="border-t border-white/10 bg-white/5 p-4 backdrop-blur">
									<Button
										className="w-full rounded-full bg-gradient-to-r from-blue-500/90 to-blue-600/90 text-white shadow-water hover:shadow-water-lg"
										onClick={() => {
											setCreateModalOpen(true);
											setMobileMenuOpen(false);
										}}
									>
										<Plus className="mr-2 h-4 w-4" /> Create New Project
									</Button>
								</div>
							</SheetContent>
						</Sheet>
					</div>
				</div>
			</nav>

			{/* Command Dialog for Search */}
			<CommandDialog open={searchOpen} onOpenChange={setSearchOpen}>
				<CommandInput placeholder="Search projects, clients, documents..." />
				<CommandList>
					<CommandEmpty>No results found.</CommandEmpty>

					<CommandGroup heading="Quick Actions">
						{QUICK_ACTIONS.map((action) => {
							const Icon = action.icon;
							return (
								<CommandItem
									key={action.name}
									value={action.name}
									onSelect={() => {
										setSearchOpen(false);
										router.push(action.href);
									}}
								>
									<Icon className="mr-2 h-4 w-4" />
									<div className="flex flex-col">
										<span className="text-sm font-medium">{action.name}</span>
										{action.description && (
											<span className="text-xs text-muted-foreground">
												{action.description}
											</span>
										)}
									</div>
								</CommandItem>
							);
						})}
					</CommandGroup>

					<CommandGroup heading="Recent Projects">
						{loadingProjects ? (
							<div className="space-y-2 p-2">
								{Array.from({ length: 3 }).map((_, index) => (
									<div key={index} className="flex items-center gap-3">
										<Skeleton className="h-8 w-8 rounded-full" />
										<div className="flex-1 space-y-1">
											<Skeleton className="h-3 w-32" />
											<Skeleton className="h-3 w-24" />
										</div>
									</div>
								))}
							</div>
						) : projects.length === 0 ? (
							<CommandItem disabled>
								<span className="text-sm text-muted-foreground">
									No recent projects.
								</span>
							</CommandItem>
						) : (
							projects.slice(0, 6).map((project) => (
								<CommandItem
									key={project.id}
									value={project.name}
									onSelect={() => {
										setSearchOpen(false);
										router.push(routes.project.detail(project.id));
									}}
								>
									<FolderOpen className="mr-2 h-4 w-4" />
									<div className="flex flex-col">
										<span className="text-sm font-medium">{project.name}</span>
										<span className="text-xs text-muted-foreground">
											{project.client}
										</span>
									</div>
									{project.status && (
										<Badge
											variant="outline"
											className="ml-auto text-[11px] capitalize"
										>
											{project.status}
										</Badge>
									)}
								</CommandItem>
							))
						)}
					</CommandGroup>

					<CommandGroup heading="Areas">
						{PRIMARY_NAV_LINKS.map((link) => {
							const Icon = link.icon;
							return (
								<CommandItem
									key={link.name}
									value={link.name}
									onSelect={() => {
										setSearchOpen(false);
										router.push(link.href);
									}}
								>
									<Icon className="mr-2 h-4 w-4" />
									<div className="flex flex-col">
										<span>{link.name}</span>
										{link.description && (
											<span className="text-xs text-muted-foreground">
												{link.description}
											</span>
										)}
									</div>
								</CommandItem>
							);
						})}
					</CommandGroup>
				</CommandList>
			</CommandDialog>

			{/* Premium Project Wizard */}
			<PremiumProjectWizard
				open={createModalOpen}
				onOpenChange={setCreateModalOpen}
				onProjectCreated={() => {
					// Project creation handled by wizard
				}}
			/>
		</>
	);
}
