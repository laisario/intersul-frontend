<!--
  Clients management page with CRUD operations
-->

<script lang="ts">
	import { goto } from '$app/navigation';
	import { useClients, useDeleteClient, useCreateClient } from '$lib/hooks/queries/use-clients.svelte.js';
	import { successToast, errorToast } from '$lib/utils/toast.js';
	import { formatDate, formatClientStatus } from '$lib/utils/formatting.js';
	import { CLIENT_STATUS } from '$lib/utils/constants.js';
	import ClientForm from '$lib/components/forms/client-form.svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Select, SelectContent, SelectItem, SelectTrigger } from '$lib/components/ui/select/index.js';
	import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '$lib/components/ui/card/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import { Skeleton } from '$lib/components/ui/skeleton/index.js';
	import type { Client, CreateClientDto, ClientStatus } from '$lib/api/types/client.types.js';

	let searchTerm = $state('');
	let statusFilter = $state<ClientStatus | 'all'>('all');
	let showNewClientModal = $state(false);

	// Query clients with filters
	const { data: clients, isLoading, refetch } = useClients(() => ({
		search: searchTerm || undefined,
		status: statusFilter !== 'all' ? statusFilter : undefined,
	}));

	const { mutate: deleteClient, isPending: isDeleting } = useDeleteClient();
	const { mutate: createClient, isPending: isCreating } = useCreateClient();

	// Reactive query params
	let queryParams = $derived({
		search: searchTerm || undefined,
		status: statusFilter !== 'all' ? statusFilter : undefined,
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

	function handleDeleteClient(client: Client) {
		if (!confirm(`Tem certeza que deseja excluir o cliente ${client.name}?`)) {
			return;
		}

		deleteClient(client.id, {
			onSuccess: () => {
				successToast.deleted('Cliente');
			},
			onError: () => {
				errorToast.delete('Cliente');
			},
		});
	}

	function handleCreateClient(event: CustomEvent<{ data: CreateClientDto }>) {
		createClient(event.detail.data, {
			onSuccess: () => {
				successToast.created('Cliente');
				showNewClientModal = false;
			},
			onError: () => {
				errorToast.create('Cliente');
			},
		});
	}

	function getStatusBadge(status: ClientStatus) {
		const statusConfig = CLIENT_STATUS[status];
		return statusConfig;
	}
</script>

<svelte:head>
	<title>Clientes - Intersul</title>
</svelte:head>

<div class="space-y-6">
	<!-- Header -->
	<div class="flex justify-between items-center">
		<div>
			<h1 class="text-3xl font-bold">Clientes</h1>
			<p class="text-muted-foreground">Gerencie sua base de clientes</p>
		</div>
		<Button onclick={() => showNewClientModal = true}>
			<svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
			</svg>
			Novo Cliente
		</Button>
	</div>
	<h1>AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA</h1>
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
						placeholder="Buscar por nome, email ou telefone"
						bind:value={searchTerm}
						oninput={handleSearch}
					/>
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
							<SelectItem value="suspended">Suspenso</SelectItem>
						</SelectContent>
					</Select>
				</div>
				<div class="flex items-end">
					<Button variant="outline" onclick={() => refetch()} class="w-full">
						<svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
						</svg>
						Atualizar
					</Button>
				</div>
			</div>
		</CardContent>
	</Card>

	<!-- Clients List -->
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
		{:else if !clients || clients.length === 0}
			<CardContent class="p-6">
				<div class="text-center py-12">
					<svg class="mx-auto h-12 w-12 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-1.306-.835-2.418-2-2.83M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-1.306.835-2.418 2-2.83m0 0a3 3 0 015.356 0M9 7a3 3 0 116 0 3 3 0 01-6 0z"></path>
					</svg>
					<h3 class="mt-2 text-sm font-medium">Nenhum cliente encontrado</h3>
					<p class="mt-1 text-sm text-muted-foreground">Comece criando um novo cliente.</p>
					<div class="mt-6">
						<Button onclick={() => showNewClientModal = true}>
							<svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
							</svg>
							Novo Cliente
						</Button>
					</div>
				</div>
			</CardContent>
		{:else}
			<CardContent class="p-0">
				<div class="divide-y">
					{#each clients as client}
						<div class="p-6 flex items-center justify-between hover:bg-muted/50">
							<div class="flex items-center space-x-4">
								<div class="h-10 w-10 rounded-full bg-primary flex items-center justify-center">
									<span class="text-sm font-medium text-primary-foreground">
										{client.name.charAt(0).toUpperCase()}
									</span>
								</div>
								<div>
									<div class="flex items-center space-x-2">
										<p class="text-sm font-medium">{client.name}</p>
										<Badge variant={getStatusBadge(client.status).color}>
											{getStatusBadge(client.status).label}
										</Badge>
									</div>
									<div class="mt-1">
										<p class="text-sm text-muted-foreground">{client.email}</p>
										{#if client.phone}
											<p class="text-sm text-muted-foreground">{client.phone}</p>
										{/if}
									</div>
								</div>
							</div>
							<div class="flex items-center space-x-2">
								{#if client.lastServiceDate}
									<span class="text-sm text-muted-foreground">
										Último serviço: {formatDate(client.lastServiceDate)}
									</span>
								{/if}
								<div class="flex space-x-1">
									<Button
										variant="ghost"
										size="sm"
										onclick={() => goto(`/clients/${client.id}`)}
									>
										Ver
									</Button>
									<Button
										variant="ghost"
										size="sm"
										onclick={() => goto(`/clients/${client.id}/edit`)}
									>
										Editar
									</Button>
									<Button
										variant="ghost"
										size="sm"
										onclick={() => handleDeleteClient(client)}
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

<!-- New Client Modal -->
{#if showNewClientModal}
	<div class="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
		<div class="bg-background rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
			<div class="p-6">
				<div class="flex items-center justify-between mb-4">
					<h3 class="text-lg font-semibold">Novo Cliente</h3>
					<Button
						variant="ghost"
						size="sm"
						onclick={() => showNewClientModal = false}
					>
						✕
					</Button>
				</div>
				<ClientForm
					on:submit={handleCreateClient}
					on:cancel={() => showNewClientModal = false}
					isLoading={isCreating}
					submitText="Criar Cliente"
					cancelText="Cancelar"
				/>
			</div>
		</div>
	</div>
{/if}
