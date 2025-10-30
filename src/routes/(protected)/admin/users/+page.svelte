<!--
  Admin users management page (Admin only)
-->

<script lang="ts">
	import { goto } from '$app/navigation';
	import { useUsers, useDeleteUser, useCreateUser, useToggleUserActive } from '$lib/hooks/queries/use-users.svelte.js';
	import { successToast, errorToast } from '$lib/utils/toast.js';
	import { formatDate, formatUserRole } from '$lib/utils/formatting.js';
	import { USER_ROLES } from '$lib/utils/constants.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Select, SelectContent, SelectItem, SelectTrigger } from '$lib/components/ui/select/index.js';
	import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '$lib/components/ui/card/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import { Skeleton } from '$lib/components/ui/skeleton/index.js';
	import { canManageUsers } from '$lib/stores/auth.svelte.js';
	import type { User, CreateUserDto, UserRole } from '$lib/api/types/auth.types.js';

	let searchTerm = $state('');
	let roleFilter = $state<UserRole | 'all'>('all');
	let statusFilter = $state<'all' | 'active' | 'inactive'>('all');
	let showNewUserModal = $state(false);

	// Query users with filters
	const { data: users, isLoading, refetch } = useUsers(() => ({
		search: searchTerm || undefined,
		role: roleFilter !== 'all' ? roleFilter : undefined,
		active: statusFilter !== 'all' ? (statusFilter === 'active') : undefined,
	}));

	const { mutate: deleteUser, isPending: isDeleting } = useDeleteUser();
	const { mutate: createUser, isPending: isCreating } = useCreateUser();
	const { mutate: toggleActive, isPending: isToggling } = useToggleUserActive();

	// Reactive query params
	let queryParams = $derived({
		search: searchTerm || undefined,
		role: roleFilter !== 'all' ? roleFilter : undefined,
		active: statusFilter !== 'all' ? (statusFilter === 'active') : undefined,
	});

	// Refetch when params change
	$effect(() => {
		if (queryParams) {
			refetch();
		}
	});

	function handleSearch() {
		// Search is handled reactively
	}

	function handleFilter() {
		// Filter is handled reactively
	}

	function handleDeleteUser(user: User) {
		if (!confirm(`Tem certeza que deseja excluir o usuário ${user.name}?`)) {
			return;
		}

		deleteUser(user.id, {
			onSuccess: () => {
				successToast.deleted('Usuário');
			},
			onError: () => {
				errorToast.delete('Usuário');
			},
		});
	}

	function handleToggleActive(user: User) {
		toggleActive(user.id, {
			onSuccess: () => {
				successToast.updated('Usuário');
			},
			onError: () => {
				errorToast.update('Usuário');
			},
		});
	}

	function handleCreateUser(event: CustomEvent<{ data: CreateUserDto }>) {
		createUser(event.detail.data, {
			onSuccess: () => {
				successToast.created('Usuário');
				showNewUserModal = false;
			},
			onError: () => {
				errorToast.create('Usuário');
			},
		});
	}

	function getRoleBadge(role: UserRole) {
		const roleConfig = USER_ROLES[role];
		return roleConfig;
	}
</script>

<svelte:head>
	<title>Usuários - Intersul</title>
</svelte:head>

{#if !$canManageUsers}
	<div class="flex items-center justify-center min-h-[400px]">
		<div class="text-center">
			<h2 class="text-2xl font-bold text-red-600">Acesso Negado</h2>
			<p class="text-muted-foreground mt-2">Você não tem permissão para acessar esta página.</p>
		</div>
	</div>
{:else}
	<div class="space-y-6">
		<!-- Header -->
		<div class="flex justify-between items-center">
			<div>
				<h1 class="text-3xl font-bold">Usuários</h1>
				<p class="text-muted-foreground">Gerencie os usuários do sistema</p>
			</div>
			<Button onclick={() => showNewUserModal = true}>
				<svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
				</svg>
				Novo Usuário
			</Button>
		</div>

		<!-- Filters -->
		<Card>
			<CardHeader>
				<CardTitle>Filtros</CardTitle>
			</CardHeader>
			<CardContent>
				<div class="grid grid-cols-1 md:grid-cols-3 gap-4">
					<div>
						<label for="search" class="block text-sm font-medium mb-2">Buscar</label>
						<Input
							id="search"
							placeholder="Buscar por nome ou email"
							bind:value={searchTerm}
							oninput={handleSearch}
						/>
					</div>
					<div>
						<label for="role" class="block text-sm font-medium mb-2">Função</label>
						<Select bind:value={roleFilter} onchange={handleFilter}>
							<SelectTrigger>
								<SelectValue placeholder="Todas as funções" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">Todas</SelectItem>
								<SelectItem value="admin">Administrador</SelectItem>
								<SelectItem value="manager">Gerente</SelectItem>
								<SelectItem value="technician">Técnico</SelectItem>
								<SelectItem value="commercial">Comercial</SelectItem>
							</SelectContent>
						</Select>
					</div>
					<div>
						<label for="status" class="block text-sm font-medium mb-2">Status</label>
						<Select bind:value={statusFilter} onchange={handleFilter}>
							<SelectTrigger>
								<SelectValue placeholder="Todos os status" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">Todos</SelectItem>
								<SelectItem value="active">Ativo</SelectItem>
								<SelectItem value="inactive">Inativo</SelectItem>
							</SelectContent>
						</Select>
					</div>
				</div>
			</CardContent>
		</Card>

		<!-- Users List -->
		<Card>
			{#if isLoading}
				<CardContent class="p-6">
					<div class="space-y-4">
						{#each Array(5) as _}
							<div class="flex items-center space-x-4">
								<Skeleton class="h-12 w-12 rounded-full" />
								<div class="space-y-2">
									<Skeleton class="h-4 w-[200px]" />
									<Skeleton class="h-4 w-[160px]" />
								</div>
							</div>
						{/each}
					</div>
				</CardContent>
			{:else if !users || users.length === 0}
				<CardContent class="p-6">
					<div class="text-center py-12">
						<svg class="mx-auto h-12 w-12 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"></path>
						</svg>
						<h3 class="mt-2 text-sm font-medium">Nenhum usuário encontrado</h3>
						<p class="mt-1 text-sm text-muted-foreground">Comece criando um novo usuário.</p>
						<div class="mt-6">
							<Button onclick={() => showNewUserModal = true}>
								<svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
								</svg>
								Novo Usuário
							</Button>
						</div>
					</div>
				</CardContent>
			{:else}
				<CardContent class="p-0">
					<div class="divide-y">
						{#each users as user}
							<div class="p-6 flex items-center justify-between hover:bg-muted/50">
								<div class="flex items-center space-x-4">
									<div class="h-10 w-10 rounded-full bg-primary flex items-center justify-center">
										<span class="text-sm font-medium text-primary-foreground">
											{user.name.charAt(0).toUpperCase()}
										</span>
									</div>
									<div>
										<div class="flex items-center space-x-2">
											<p class="text-sm font-medium">{user.name}</p>
											<Badge variant={getRoleBadge(user.role).color}>
												{getRoleBadge(user.role).label}
											</Badge>
											<Badge variant={user.active ? 'default' : 'secondary'}>
												{user.active ? 'Ativo' : 'Inativo'}
											</Badge>
										</div>
										<div class="mt-1">
											<p class="text-sm text-muted-foreground">{user.email}</p>
											{#if user.position}
												<p class="text-sm text-muted-foreground">{user.position}</p>
											{/if}
										</div>
									</div>
								</div>
								<div class="flex items-center space-x-2">
									<span class="text-sm text-muted-foreground">
										Criado: {formatDate(user.created_at)}
									</span>
									<div class="flex space-x-1">
										<Button
											variant="ghost"
											size="sm"
											onclick={() => handleToggleActive(user)}
											disabled={isToggling}
										>
											{user.active ? 'Desativar' : 'Ativar'}
										</Button>
										<Button
											variant="ghost"
											size="sm"
											onclick={() => goto(`/admin/users/${user.id}/edit`)}
										>
											Editar
										</Button>
										<Button
											variant="ghost"
											size="sm"
											onclick={() => handleDeleteUser(user)}
											disabled={isDeleting}
										>
											Excluir
										</Button>
									</div>
								</div>
							</div>
						{/each}
					</div>
				</CardContent>
			{/if}
		</Card>
	</div>

	<!-- New User Modal -->
	{#if showNewUserModal}
		<div class="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
			<div class="bg-background rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
				<div class="p-6">
					<div class="flex items-center justify-between mb-4">
						<h3 class="text-lg font-semibold">Novo Usuário</h3>
						<Button
							variant="ghost"
							size="sm"
							onclick={() => showNewUserModal = false}
						>
							✕
						</Button>
					</div>
					<!-- TODO: Implement user form component -->
					<div class="text-center py-8">
						<p class="text-muted-foreground">Formulário de novo usuário será implementado em breve.</p>
					</div>
				</div>
			</div>
		</div>
	{/if}
{/if}
