<!--
  Client details page with machines and service history
-->

<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { useClient } from '$lib/hooks/queries/use-clients.svelte.js';
	import { errorToast, successToast } from '$lib/utils/toast.js';
	import { formatDate } from '$lib/utils/formatting.js';
	import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '$lib/components/ui/card/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Skeleton } from '$lib/components/ui/skeleton/index.js';
	import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '$lib/components/ui/table/index.js';
	import { 
		ArrowLeft, 
		Edit, 
		Phone, 
		Mail, 
		MapPin, 
		Printer, 
		Wrench,
		Calendar,
		User
	} from 'lucide-svelte';
	import { goto } from '$app/navigation';
	import type { Client } from '$lib/api/types/client.types.js';

	let clientId = $derived(Number($page.params.id));

	const { data: client, isLoading, refetch } = useClient(() => clientId);

	function goBack() {
		goto('/clients');
	}

	function handleEditClient() {
		goto(`/clients/${clientId}/edit`);
	}

	// Mock data for machines and services - will be replaced with real API calls
	let clientMachines = $state([
		{
			id: 1,
			model: 'HP LaserJet Pro M404n',
			serialNumber: 'ABC123456',
			lastService: '2024-01-15',
			status: 'active'
		},
		{
			id: 2,
			model: 'Canon imageCLASS LBP6230dn',
			serialNumber: 'DEF789012',
			lastService: '2024-01-10',
			status: 'maintenance'
		}
	]);

	let serviceHistory = $state([
		{
			id: 1,
			title: 'Manutenção Preventiva',
			machine: 'HP LaserJet Pro M404n',
			date: '2024-01-15',
			status: 'completed',
			technician: 'João Silva'
		},
		{
			id: 2,
			title: 'Troca de Toner',
			machine: 'Canon imageCLASS LBP6230dn',
			date: '2024-01-10',
			status: 'completed',
			technician: 'Maria Santos'
		},
		{
			id: 3,
			title: 'Reparo de Impressão',
			machine: 'HP LaserJet Pro M404n',
			date: '2024-01-05',
			status: 'completed',
			technician: 'João Silva'
		}
	]);
</script>

<svelte:head>
	<title>Cliente {client?.name || 'Carregando...'} - Intersul</title>
</svelte:head>

{#if isLoading}
	<div class="space-y-6">
		<!-- Header Skeleton -->
		<div class="flex items-center justify-between">
			<div class="flex items-center space-x-4">
				<Skeleton class="h-10 w-10" />
				<div>
					<Skeleton class="h-8 w-48" />
					<Skeleton class="h-4 w-32 mt-2" />
				</div>
			</div>
			<Skeleton class="h-10 w-32" />
		</div>

		<!-- Content Skeleton -->
		<div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
			<div class="lg:col-span-2 space-y-6">
				<Card>
					<CardHeader>
						<Skeleton class="h-6 w-32" />
					</CardHeader>
					<CardContent>
						<div class="space-y-4">
							{#each Array(3) as _}
								<Skeleton class="h-4 w-full" />
							{/each}
						</div>
					</CardContent>
				</Card>
			</div>
			<div class="space-y-6">
				<Card>
					<CardHeader>
						<Skeleton class="h-6 w-24" />
					</CardHeader>
					<CardContent>
						<Skeleton class="h-4 w-full" />
					</CardContent>
				</Card>
			</div>
		</div>
	</div>
{:else if client}
	<div class="space-y-6">
		<!-- Header -->
		<div class="flex items-center justify-between">
			<div class="flex items-center space-x-4">
				<Button variant="ghost" size="sm" on:click={goBack}>
					<ArrowLeft class="w-4 h-4 mr-2" />
					Voltar
				</Button>
				<div>
					<h1 class="text-3xl font-bold">{client.name}</h1>
					<p class="text-muted-foreground">
						Cliente desde {formatDate(client.createdAt)}
					</p>
				</div>
			</div>
			<Button on:click={handleEditClient}>
				<Edit class="w-4 h-4 mr-2" />
				Editar Cliente
			</Button>
		</div>

		<!-- Main Content -->
		<div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
			<!-- Client Info & Machines -->
			<div class="lg:col-span-2 space-y-6">
				<!-- Client Information -->
				<Card>
					<CardHeader>
						<CardTitle>Informações do Cliente</CardTitle>
					</CardHeader>
					<CardContent class="space-y-4">
						{#if client.email}
							<div class="flex items-center space-x-3">
								<Mail class="w-4 h-4 text-muted-foreground" />
								<span class="text-sm">{client.email}</span>
							</div>
						{/if}
						
						{#if client.phone}
							<div class="flex items-center space-x-3">
								<Phone class="w-4 h-4 text-muted-foreground" />
								<span class="text-sm">{client.phone}</span>
							</div>
						{/if}
						
						{#if client.address}
							<div class="flex items-center space-x-3">
								<MapPin class="w-4 h-4 text-muted-foreground" />
								<span class="text-sm">{client.address}</span>
							</div>
						{/if}
						
						<div class="flex items-center space-x-3">
							<Badge variant={client.status === 'active' ? 'default' : client.status === 'inactive' ? 'secondary' : 'destructive'}>
								{client.status === 'active' ? 'Ativo' : client.status === 'inactive' ? 'Inativo' : 'Suspenso'}
							</Badge>
						</div>
						
						{#if client.notes}
							<div class="pt-4 border-t">
                 <div class="text-sm font-medium text-muted-foreground">Observações</div>
								<p class="text-sm mt-1">{client.notes}</p>
							</div>
						{/if}
					</CardContent>
				</Card>

				<!-- Client Machines -->
				<Card>
					<CardHeader>
						<CardTitle class="flex items-center">
							<Printer class="w-5 h-5 mr-2" />
							Máquinas do Cliente
						</CardTitle>
						<CardDescription>
							Máquinas associadas a este cliente
						</CardDescription>
					</CardHeader>
					<CardContent>
						{#if clientMachines.length > 0}
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>Modelo</TableHead>
										<TableHead>Nº Série</TableHead>
										<TableHead>Último Serviço</TableHead>
										<TableHead>Status</TableHead>
										<TableHead class="w-[100px]">Ações</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{#each clientMachines as machine}
										<TableRow class="cursor-pointer hover:bg-muted/50" on:click={() => goto(`/machines/${machine.id}`)}>
											<TableCell class="font-medium">{machine.model}</TableCell>
											<TableCell>{machine.serialNumber}</TableCell>
											<TableCell>{formatDate(machine.lastService)}</TableCell>
											<TableCell>
												<Badge variant={machine.status === 'active' ? 'default' : 'secondary'}>
													{machine.status === 'active' ? 'Ativa' : 'Manutenção'}
												</Badge>
											</TableCell>
											<TableCell>
												<Button variant="ghost" size="sm">
													<Wrench class="w-4 h-4" />
												</Button>
											</TableCell>
										</TableRow>
									{/each}
								</TableBody>
							</Table>
						{:else}
							<div class="text-center py-8 text-muted-foreground">
								<Printer class="w-12 h-12 mx-auto mb-4 opacity-50" />
								<p class="text-lg font-medium">Nenhuma máquina associada</p>
								<p class="text-sm">Este cliente ainda não possui máquinas cadastradas</p>
							</div>
						{/if}
					</CardContent>
				</Card>

				<!-- Service History -->
				<Card>
					<CardHeader>
						<CardTitle class="flex items-center">
							<Wrench class="w-5 h-5 mr-2" />
							Histórico de Serviços
						</CardTitle>
						<CardDescription>
							Últimos serviços realizados para este cliente
						</CardDescription>
					</CardHeader>
					<CardContent>
						{#if serviceHistory.length > 0}
							<div class="space-y-4">
								{#each serviceHistory as service}
									<div class="flex items-start space-x-3 p-4 border rounded-lg">
										<div class="flex-shrink-0">
											<div class="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
												<Wrench class="w-4 h-4 text-primary" />
											</div>
										</div>
										<div class="flex-1 min-w-0">
											<div class="flex items-center justify-between">
												<h4 class="font-medium">{service.title}</h4>
												<Badge variant={service.status === 'completed' ? 'default' : 'secondary'}>
													{service.status === 'completed' ? 'Concluído' : 'Em Andamento'}
												</Badge>
											</div>
											<p class="text-sm text-muted-foreground mt-1">
												Máquina: {service.machine}
											</p>
											<div class="flex items-center space-x-4 mt-2 text-xs text-muted-foreground">
												<div class="flex items-center space-x-1">
													<Calendar class="w-3 h-3" />
													<span>{formatDate(service.date)}</span>
												</div>
												<div class="flex items-center space-x-1">
													<User class="w-3 h-3" />
													<span>{service.technician}</span>
												</div>
											</div>
										</div>
										<Button variant="ghost" size="sm" on:click={() => goto(`/services/${service.id}`)}>
											Ver Detalhes
										</Button>
									</div>
								{/each}
							</div>
						{:else}
							<div class="text-center py-8 text-muted-foreground">
								<Wrench class="w-12 h-12 mx-auto mb-4 opacity-50" />
								<p class="text-lg font-medium">Nenhum serviço realizado</p>
								<p class="text-sm">Este cliente ainda não possui histórico de serviços</p>
							</div>
						{/if}
					</CardContent>
				</Card>
			</div>

			<!-- Client Stats -->
			<div class="space-y-6">
				<Card>
					<CardHeader>
						<CardTitle>Estatísticas</CardTitle>
					</CardHeader>
					<CardContent class="space-y-4">
						<div class="flex items-center justify-between">
							<span class="text-sm font-medium">Total de Máquinas</span>
							<span class="text-2xl font-bold">{clientMachines.length}</span>
						</div>
						<div class="flex items-center justify-between">
							<span class="text-sm font-medium">Serviços Realizados</span>
							<span class="text-2xl font-bold">{serviceHistory.length}</span>
						</div>
						<div class="flex items-center justify-between">
							<span class="text-sm font-medium">Último Serviço</span>
							<span class="text-sm text-muted-foreground">
								{serviceHistory.length > 0 ? formatDate(serviceHistory[0].date) : 'N/A'}
							</span>
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>Ações Rápidas</CardTitle>
					</CardHeader>
					<CardContent class="space-y-2">
						<Button variant="outline" class="w-full justify-start" on:click={() => goto('/services/new')}>
							<Wrench class="w-4 h-4 mr-2" />
							Novo Serviço
						</Button>
						<Button variant="outline" class="w-full justify-start" on:click={() => goto('/machines/new')}>
							<Printer class="w-4 h-4 mr-2" />
							Adicionar Máquina
						</Button>
					</CardContent>
				</Card>
			</div>
		</div>
	</div>
{:else}
	<div class="text-center py-12">
		<div class="text-muted-foreground">
			<p class="text-lg font-medium">Cliente não encontrado</p>
			<p class="text-sm">O cliente solicitado não existe ou foi removido.</p>
			<Button variant="outline" class="mt-4" on:click={goBack}>
				<ArrowLeft class="w-4 h-4 mr-2" />
				Voltar aos Clientes
			</Button>
		</div>
	</div>
{/if}
