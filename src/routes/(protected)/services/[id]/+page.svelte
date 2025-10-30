<!--
  Service details page with steps management
-->

<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { useService } from '$lib/hooks/queries/use-services.svelte.js';
	import { useCreateStep, useUpdateStep, useDeleteStep } from '$lib/hooks/queries/use-service-steps.svelte.js';
	import { errorToast, successToast } from '$lib/utils/toast.js';
	import { formatDate, formatServiceStatus } from '$lib/utils/formatting.js';
	import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '$lib/components/ui/card/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Skeleton } from '$lib/components/ui/skeleton/index.js';
	import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '$lib/components/ui/sheet/index.js';
	import StepForm from '$lib/components/forms/step-form.svelte';
	import { 
		ArrowLeft, 
		Edit, 
		Plus, 
		CheckCircle, 
		Clock, 
		User, 
		Printer,
		Calendar,
		FileText,
		Trash2
	} from 'lucide-svelte';
	import { goto } from '$app/navigation';
	import type { Service, ServiceStep, ServiceStepStatus } from '$lib/api/types/service.types.js';

	let serviceId = $derived(Number($page.params.id));
	let showAddStepModal = $state(false);
	let showEditStepModal = $state(false);
	let selectedStep = $state<ServiceStep | null>(null);

	const { data: service, isLoading, refetch } = useService(() => serviceId);
	const { mutate: createStep, isPending: isCreatingStep } = useCreateStep();
	const { mutate: updateStep, isPending: isUpdatingStep } = useUpdateStep();
	const { mutate: deleteStep, isPending: isDeletingStep } = useDeleteStep();

	function goBack() {
		goto('/dashboard');
	}

	function handleAddStep() {
		showAddStepModal = true;
	}

	function handleEditStep(step: ServiceStep) {
		selectedStep = step;
		showEditStepModal = true;
	}

	function closeModals() {
		showAddStepModal = false;
		showEditStepModal = false;
		selectedStep = null;
		refetch();
	}

	function handleCreateStep(data: { title: string; description?: string; assignedUserId?: number; status?: ServiceStepStatus }) {
		createStep({ serviceId, data }, {
			onSuccess: () => {
				successToast.stepCreated();
				closeModals();
			},
			onError: (error) => {
				console.error('Error creating step:', error);
				errorToast.create('passo');
			}
		});
	}

	function handleUpdateStep(data: { title: string; description?: string; assignedUserId?: number; status?: ServiceStepStatus }) {
		if (!selectedStep) return;
		
		updateStep({ serviceId, stepId: selectedStep.id, data }, {
			onSuccess: () => {
				successToast.stepUpdated();
				closeModals();
			},
			onError: (error) => {
				console.error('Error updating step:', error);
				errorToast.update('passo');
			}
		});
	}

	function handleDeleteStep(step: ServiceStep) {
		if (!confirm(`Tem certeza que deseja excluir o passo "${step.title}"?`)) {
			return;
		}

		deleteStep({ serviceId, stepId: step.id }, {
			onSuccess: () => {
				successToast.stepDeleted(step.title);
				refetch();
			},
			onError: (error) => {
				console.error('Error deleting step:', error);
				errorToast.delete('passo');
			}
		});
	}

	function getStepStatusIcon(status: string) {
		switch (status) {
			case 'completed':
				return CheckCircle;
			case 'in_progress':
				return Clock;
			default:
				return Clock;
		}
	}

	function getStepStatusColor(status: string) {
		switch (status) {
			case 'completed':
				return 'text-green-600';
			case 'in_progress':
				return 'text-blue-600';
			default:
				return 'text-gray-600';
		}
	}
</script>

<svelte:head>
	<title>Serviço #{serviceId} - Intersul</title>
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
								<div class="flex items-center space-x-3">
									<Skeleton class="h-8 w-8 rounded-full" />
									<div class="space-y-2">
										<Skeleton class="h-4 w-[200px]" />
										<Skeleton class="h-3 w-[100px]" />
									</div>
								</div>
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
{:else if service}
	<div class="space-y-6">
		<!-- Header -->
		<div class="flex items-center justify-between">
			<div class="flex items-center space-x-4">
				<Button variant="ghost" size="sm" on:click={goBack}>
					<ArrowLeft class="w-4 h-4 mr-2" />
					Voltar
				</Button>
				<div>
					<h1 class="text-3xl font-bold">#{service.id} - {service.title}</h1>
					<p class="text-muted-foreground">
						Cliente: {service.client.name} • 
						Categoria: {service.category.name} • 
						Status: {formatServiceStatus(service.status)}
					</p>
				</div>
			</div>
			<div class="flex items-center space-x-2">
				<Button variant="outline" on:click={() => goto(`/services/${service.id}/edit`)}>
					<Edit class="w-4 h-4 mr-2" />
					Editar
				</Button>
				{#if service.status !== 'completed'}
					<Button on:click={() => {
						// Mark as completed
						console.log('Mark as completed');
					}}>
						<CheckCircle class="w-4 h-4 mr-2" />
						Marcar como Concluído
					</Button>
				{/if}
			</div>
		</div>

		<!-- Main Content -->
		<div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
			<!-- Service Steps -->
			<div class="lg:col-span-2">
				<Card>
					<CardHeader>
						<div class="flex items-center justify-between">
							<CardTitle class="flex items-center">
								<FileText class="w-5 h-5 mr-2" />
								Passos do Serviço
							</CardTitle>
							<Button variant="outline" size="sm" on:click={handleAddStep}>
								<Plus class="w-4 h-4 mr-2" />
								Adicionar Passo
							</Button>
						</div>
						<CardDescription>
							Gerencie os passos e responsáveis do serviço
						</CardDescription>
					</CardHeader>
					<CardContent>
						{#if service.steps && service.steps.length > 0}
							<div class="space-y-4">
								{#each service.steps as step, index}
									{@const StatusIcon = getStepStatusIcon(step.status)}
									<div class="flex items-start space-x-3 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
										<div class="flex-shrink-0">
											<div class="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
												<span class="text-sm font-medium">{index + 1}</span>
											</div>
										</div>
										<div class="flex-1 min-w-0">
											<div class="flex items-center justify-between">
												<h4 class="font-medium">{step.title}</h4>
												<div class="flex items-center space-x-2">
													<StatusIcon class="w-4 h-4 {getStepStatusColor(step.status)}" />
													<Badge variant={step.status === 'completed' ? 'default' : step.status === 'in_progress' ? 'secondary' : 'outline'}>
														{step.status === 'completed' ? 'Concluído' : step.status === 'in_progress' ? 'Em Andamento' : 'Pendente'}
													</Badge>
												</div>
											</div>
											{#if step.description}
												<p class="text-sm text-muted-foreground mt-1">{step.description}</p>
											{/if}
											{#if step.responsable}
												<div class="flex items-center space-x-2 mt-2">
													<User class="w-4 h-4 text-muted-foreground" />
													<span class="text-sm text-muted-foreground">
														Responsável: {step.responsable.name}
													</span>
												</div>
											{/if}
											{#if step.completedAt}
												<div class="flex items-center space-x-2 mt-2">
													<Calendar class="w-4 h-4 text-muted-foreground" />
													<span class="text-sm text-muted-foreground">
														Concluído em: {formatDate(step.completedAt)}
													</span>
												</div>
											{/if}
										</div>
										<div class="flex items-center space-x-1">
											<Button
												variant="ghost"
												size="sm"
												on:click={() => handleEditStep(step)}
											>
												<Edit class="w-4 h-4" />
											</Button>
											<Button
												variant="ghost"
												size="sm"
												on:click={() => handleDeleteStep(step)}
												disabled={isDeletingStep}
												class="text-red-600 hover:text-red-700"
											>
												<Trash2 class="w-4 h-4" />
											</Button>
										</div>
									</div>
								{/each}
							</div>
						{:else}
							<div class="text-center py-8 text-muted-foreground">
								<FileText class="w-12 h-12 mx-auto mb-4 opacity-50" />
								<p class="text-lg font-medium">Nenhum passo definido</p>
								<p class="text-sm">Adicione passos para organizar o serviço</p>
								<Button variant="outline" class="mt-4" on:click={handleAddStep}>
									<Plus class="w-4 h-4 mr-2" />
									Adicionar Primeiro Passo
								</Button>
							</div>
						{/if}
					</CardContent>
				</Card>
			</div>

			<!-- Service Info & Machine -->
			<div class="space-y-6">
				<!-- Service Info -->
				<Card>
					<CardHeader>
						<CardTitle>Informações do Serviço</CardTitle>
					</CardHeader>
					<CardContent class="space-y-4">
						<div>
               <div class="text-sm font-medium text-muted-foreground">Status</div>
							<div class="mt-1">
								<Badge variant={service.status === 'completed' ? 'default' : service.status === 'in_progress' ? 'secondary' : 'outline'}>
									{formatServiceStatus(service.status)}
								</Badge>
							</div>
						</div>
						
						{#if service.assignedTo}
							<div>
                 <div class="text-sm font-medium text-muted-foreground">Responsável</div>
								<p class="text-sm mt-1">{service.assignedTo.name}</p>
							</div>
						{/if}
						
						{#if service.scheduledDate}
							<div>
                 <div class="text-sm font-medium text-muted-foreground">Data Agendada</div>
								<p class="text-sm mt-1">{formatDate(service.scheduledDate)}</p>
							</div>
						{/if}
						
						{#if service.estimatedDuration}
							<div>
                 <div class="text-sm font-medium text-muted-foreground">Duração Estimada</div>
								<p class="text-sm mt-1">{service.estimatedDuration} minutos</p>
							</div>
						{/if}
						
						<div>
               <div class="text-sm font-medium text-muted-foreground">Criado em</div>
							<p class="text-sm mt-1">{formatDate(service.createdAt)}</p>
						</div>
						
						{#if service.notes}
							<div>
                 <div class="text-sm font-medium text-muted-foreground">Observações</div>
								<p class="text-sm mt-1">{service.notes}</p>
							</div>
						{/if}
					</CardContent>
				</Card>

				<!-- Machine Info (if linked) -->
				{#if service.clientCopyMachineId}
					<Card>
						<CardHeader>
							<CardTitle class="flex items-center">
								<Printer class="w-5 h-5 mr-2" />
								Informações da Máquina
							</CardTitle>
						</CardHeader>
						<CardContent>
							<div class="text-center py-4 text-muted-foreground">
								<Printer class="w-12 h-12 mx-auto mb-4 opacity-50" />
								<p class="text-sm">Detalhes da máquina serão implementados</p>
								<Button variant="outline" size="sm" class="mt-2">
									Ver Histórico da Máquina
								</Button>
							</div>
						</CardContent>
					</Card>
				{/if}
			</div>
		</div>
	</div>
{:else}
	<div class="text-center py-12">
		<div class="text-muted-foreground">
			<p class="text-lg font-medium">Serviço não encontrado</p>
			<p class="text-sm">O serviço solicitado não existe ou foi removido.</p>
			<Button variant="outline" class="mt-4" on:click={goBack}>
				<ArrowLeft class="w-4 h-4 mr-2" />
				Voltar ao Dashboard
			</Button>
		</div>
	</div>
{/if}

<!-- Add Step Modal -->
<Sheet bind:open={showAddStepModal}>
	<SheetContent class="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
		<SheetHeader>
			<SheetTitle>Adicionar Passo</SheetTitle>
			<SheetDescription>
				Adicione um novo passo ao serviço.
			</SheetDescription>
		</SheetHeader>
		<StepForm 
			onSubmit={handleCreateStep}
			onCancel={() => (showAddStepModal = false)}
			isLoading={isCreatingStep}
		/>
	</SheetContent>
</Sheet>

<!-- Edit Step Modal -->
<Sheet bind:open={showEditStepModal}>
	<SheetContent class="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
		<SheetHeader>
			<SheetTitle>Editar Passo</SheetTitle>
			<SheetDescription>
				Edite os detalhes do passo.
			</SheetDescription>
		</SheetHeader>
		<StepForm 
			step={selectedStep}
			onSubmit={handleUpdateStep}
			onCancel={() => (showEditStepModal = false)}
			isLoading={isUpdatingStep}
		/>
	</SheetContent>
</Sheet>
