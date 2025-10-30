<script lang="ts">
	import DataTable from "$lib/components/data-table.svelte";
	import { useServices } from "$lib/hooks/queries/use-services.svelte.js";
	import { onMount } from "svelte";

	// Fetch services data from API
	const servicesQuery = useServices();
	
	// Debug logging
	$: console.log('Services query state:', {
		isLoading: servicesQuery.isLoading,
		error: servicesQuery.error,
		data: servicesQuery.data,
		status: servicesQuery.status
	});
	
	// Transform the data to match the expected schema
	$: data = servicesQuery.data?.map(service => ({
		id: service.id,
		title: service.title,
		description: service.description,
		status: service.status,
		priority: service.priority,
		client: {
			id: service.client.id,
			name: service.client.name,
			email: service.client.email
		},
		category: {
			id: service.category.id,
			name: service.category.name,
			description: service.category.description,
			color: service.category.color
		},
		created_at: service.created_at,
		updated_at: service.updated_at,
		steps: service.steps || []
	})) || [];
</script>

<div class="flex flex-1 flex-col">
	<div class="@container/main flex flex-1 flex-col gap-2">
	  <div class="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
		<h1 class="px-4 lg:px-6 text-2xl font-bold text-gray-900 dark:text-gray-100">
			Confira sua lista de serviços
		</h1>
		<p class="px-4 lg:px-6 text-sm text-gray-500 dark:text-gray-400">
			Aqui você pode conferir sua lista de serviços e gerenciar seus serviços.
		</p>
		
		<DataTable {data} />
		<!-- {#if servicesQuery.isLoading || servicesQuery.status === 'pending'}
			<div class="flex items-center justify-center py-8">
				<div class="text-center">
					<div class="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-gray-100 mx-auto"></div>
					<p class="mt-2 text-sm text-gray-500 dark:text-gray-400">Carregando serviços...</p>
				</div>
			</div>
		{:else if servicesQuery.error}
			<div class="flex items-center justify-center py-8">
				<div class="text-center">
					<p class="text-red-600 dark:text-red-400">Erro ao carregar serviços</p>
					<p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
						{servicesQuery.error?.message || 'Tente novamente mais tarde'}
					</p>
				</div>
			</div>
		{:else if !!servicesQuery.data.length}
		{:else}
			<div class="flex items-center justify-center py-8">
				<div class="text-center">
					<p class="text-gray-500 dark:text-gray-400">Nenhum serviço encontrado</p>
					<p class="text-sm text-gray-400 dark:text-gray-500 mt-1">
						Clique em "Adicionar Serviço" para criar seu primeiro serviço
					</p>
				</div>
			</div>
		{/if} -->
	  </div>
	</div>
  </div>