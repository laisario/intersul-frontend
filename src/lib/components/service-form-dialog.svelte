<script lang="ts">
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import * as Select from '$lib/components/ui/select/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import { useCreateService, useUpdateService } from '$lib/hooks/queries/use-services.svelte.js';
	import { useClients } from '$lib/hooks/queries/use-clients.svelte.js';
	import { useCategories } from '$lib/hooks/queries/use-categories.svelte.js';
	import { useUsers } from '$lib/hooks/queries/use-users.svelte.js';
	import type { Service, CreateServiceDto, UpdateServiceDto } from '$lib/api/types/service.types.js';
	import type { Schema } from '$lib/components/schemas.js';
	import ClockIcon from '@tabler/icons-svelte/icons/clock';
	import AlertCircleIcon from '@tabler/icons-svelte/icons/alert-circle';
	import { toast } from 'svelte-sonner';

	interface Props {
		open: boolean;
		service?: Schema | null;
		onClose: () => void;
	}

	let { open, service, onClose }: Props = $props();

	// Form state
	let formData = $state<CreateServiceDto>({
		description: '',
		categoryId: 0,
		clientId: 0,
		assignedToId: undefined,
		clientCopyMachineId: undefined,
		steps: []
	});

	// API hooks
	const clientsQuery = useClients();
	const categoriesQuery = useCategories();
	const usersQuery = useUsers();
	const createServiceMutation = useCreateService();
	const updateServiceMutation = useUpdateService();

	// Initialize form data when service changes
	$effect(() => {
		if (service) {
			formData = {
				description: service.description || '',
				categoryId: service.category?.id || 0,
				clientId: service.client?.id || 0,
				assignedToId: service.assignedTo?.id || undefined,
				clientCopyMachineId: service.clientCopyMachineId || undefined,
				steps: service.steps?.map(step => ({
					title: step.title,
					description: step.description,
					assignedUserId: step.responsable?.id
				})) || []
			};
		} else {
			// Reset form for new service
			formData = {
				description: '',
				categoryId: 0,
				clientId: 0,
				assignedToId: undefined,
				clientCopyMachineId: undefined,
				steps: []
			};
		}
	});

	// Form validation
	let errors = $state<Record<string, string>>({});

	function validateForm(): boolean {
		errors = {};
		
		if (!formData.categoryId) {
			errors.categoryId = 'Categoria é obrigatória';
		}
		if (!formData.clientId) {
			errors.clientId = 'Cliente é obrigatório';
		}

		return Object.keys(errors).length === 0;
	}

	async function handleSubmit() {
		if (!validateForm()) {
			toast.error('Por favor, corrija os erros no formulário');
			return;
		}

		try {
			if (service) {
				// Update existing service
				const updateData: UpdateServiceDto = {
					id: service.id,
					description: formData.description,
					categoryId: formData.categoryId,
					clientId: formData.clientId,
					assignedToId: formData.assignedToId,
					clientCopyMachineId: formData.clientCopyMachineId,
					steps: formData.steps
				};
				await updateServiceMutation.mutateAsync({
					id: service.id,
					data: updateData
				});
				toast.success('Serviço atualizado com sucesso!');
			} else {
				// Create new service
				await createServiceMutation.mutateAsync(formData);
				toast.success('Serviço criado com sucesso!');
			}
			onClose();
		} catch (error) {
			console.error('Error saving service:', error);
			toast.error('Erro ao salvar serviço');
		}
	}

	function handleClose() {
		errors = {};
		onClose();
	}

</script>

<Dialog.Root bind:open>
	<Dialog.Content class="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
		<Dialog.Header>
			<Dialog.Title>
				{service ? 'Editar Serviço' : 'Criar Novo Serviço'}
			</Dialog.Title>
			<Dialog.Description>
				{service ? 'Atualize as informações do serviço' : 'Preencha os dados para criar um novo serviço'}
			</Dialog.Description>
		</Dialog.Header>

		<div class="space-y-6 p-6">
			<!-- Description -->
			<div class="space-y-2">
				<Label for="description">Descrição</Label>
				<textarea
					id="description"
					bind:value={formData.description}
					placeholder="Descreva o serviço em detalhes"
					rows={3}
					class="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
				></textarea>
			</div>

			<!-- Client and Category -->
			<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
				<div class="space-y-2">
					<Label for="client">Cliente *</Label>
					<Select.Root
						type="single"
						value={formData.clientId?.toString()}
						onValueChange={(value) => formData.clientId = parseInt(value)}
					>
						<Select.Trigger class={errors.clientId ? 'border-red-500' : ''}>
							{formData.clientId ? clientsQuery.data?.find(c => c.id === formData.clientId)?.name || 'Selecione um cliente' : 'Selecione um cliente'}
						</Select.Trigger>
						<Select.Content>
							{#if clientsQuery.isLoading}
								<Select.Item value="" disabled>Carregando clientes...</Select.Item>
							{:else if clientsQuery.error}
								<Select.Item value="" disabled>Erro ao carregar clientes</Select.Item>
							{:else}
								{#each clientsQuery.data || [] as client (client.id)}
									<Select.Item value={client.id.toString()}>
										{client.name}
									</Select.Item>
								{/each}
							{/if}
						</Select.Content>
					</Select.Root>
					{#if errors.clientId}
						<p class="text-sm text-red-500 flex items-center gap-1">
							<AlertCircleIcon class="size-4" />
							{errors.clientId}
						</p>
					{/if}
				</div>

				<div class="space-y-2">
					<Label for="category">Categoria *</Label>
					<Select.Root
						type="single"
						value={formData.categoryId?.toString()}
						onValueChange={(value) => formData.categoryId = parseInt(value)}
					>
						<Select.Trigger class={errors.categoryId ? 'border-red-500' : ''}>
							{formData.categoryId ? categoriesQuery.data?.data?.find(c => c.id === formData.categoryId)?.name || 'Selecione uma categoria' : 'Selecione uma categoria'}
						</Select.Trigger>
						<Select.Content>
							{#if categoriesQuery.isLoading}
								<Select.Item value="" disabled>Carregando categorias...</Select.Item>
							{:else if categoriesQuery.error}
								<Select.Item value="" disabled>Erro ao carregar categorias</Select.Item>
							{:else}
								{#each categoriesQuery.data?.data || [] as category (category.id)}
									<Select.Item value={category.id.toString()}>
										<div class="flex items-center gap-2">
											{#if category.color}
												<div 
													class="size-3 rounded-full" 
													style="background-color: {category.color}"
												></div>
											{/if}
											{category.name}
										</div>
									</Select.Item>
								{/each}
							{/if}
						</Select.Content>
					</Select.Root>
					{#if errors.categoryId}
						<p class="text-sm text-red-500 flex items-center gap-1">
							<AlertCircleIcon class="size-4" />
							{errors.categoryId}
						</p>
					{/if}
				</div>
			</div>


			<!-- Assigned User -->
			<div class="space-y-2">
				<Label for="assignedTo">Responsável</Label>
				<Select.Root
					type="single"
					value={formData.assignedToId?.toString()}
					onValueChange={(value) => formData.assignedToId = value ? parseInt(value) : undefined}
				>
					<Select.Trigger>
						{formData.assignedToId ? usersQuery.data?.find(u => u.id === formData.assignedToId)?.name || 'Selecione um responsável' : 'Selecione um responsável'}
					</Select.Trigger>
					<Select.Content>
						<Select.Item value="">
							<span class="text-muted-foreground">Nenhum responsável</span>
						</Select.Item>
						{#if usersQuery.isLoading}
							<Select.Item value="" disabled>Carregando usuários...</Select.Item>
						{:else if usersQuery.error}
							<Select.Item value="" disabled>Erro ao carregar usuários</Select.Item>
						{:else}
							{#each usersQuery.data || [] as user (user.id)}
								<Select.Item value={user.id.toString()}>
									{user.name}
								</Select.Item>
							{/each}
						{/if}
					</Select.Content>
				</Select.Root>
			</div>
		</div>

		<Dialog.Footer class="flex gap-2">
			<Button variant="outline" onclick={handleClose}>
				Cancelar
			</Button>
			<Button 
				onclick={handleSubmit}
				disabled={createServiceMutation.isPending || updateServiceMutation.isPending}
			>
				{#if createServiceMutation.isPending || updateServiceMutation.isPending}
					<ClockIcon class="size-4 animate-spin mr-2" />
				{/if}
				{service ? 'Atualizar' : 'Criar'} Serviço
			</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
