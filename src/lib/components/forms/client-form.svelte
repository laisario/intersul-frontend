<!--
  Reusable client form component with validation
-->

<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { 
    FieldGroup, 
    Field, 
    FieldLabel, 
    FieldError 
  } from '$lib/components/ui/field/index.js';
  import { Input } from '$lib/components/ui/input/index.js';
  import { Button } from '$lib/components/ui/button/index.js';
  import { Select, SelectContent, SelectItem, SelectTrigger } from '$lib/components/ui/select/index.js';
  import { clientSchema, validateForm, getFieldError } from '$lib/utils/validation.js';
  import { formatPhone } from '$lib/utils/formatting.js';
  import type { Client, CreateClientDto, UpdateClientDto, ClientStatus } from '$lib/api/types/client.types.js';

  const dispatch = createEventDispatcher<{
    submit: { data: CreateClientDto | UpdateClientDto };
    cancel: void;
  }>();

  let {
    client = null,
    isLoading = false,
    submitText = 'Salvar',
    cancelText = 'Cancelar',
    showCancel = true,
  }: {
    client?: Client | null;
    isLoading?: boolean;
    submitText?: string;
    cancelText?: string;
    showCancel?: boolean;
  } = $props();

  // Form state
  let formData = $state({
    name: client?.name || '',
    email: client?.email || '',
    phone: client?.phone || '',
    address: client?.address || '',
    city: client?.city || '',
    state: client?.state || '',
    zipCode: client?.zipCode || '',
    company: client?.company || '',
    contactPerson: client?.contactPerson || '',
    notes: client?.notes || '',
    status: client?.status || ClientStatus.ACTIVE,
  });

  let errors = $state<Record<string, string>>({});

  // Client status options
  const statusOptions = [
    { value: ClientStatus.ACTIVE, label: 'Ativo' },
    { value: ClientStatus.INACTIVE, label: 'Inativo' },
    { value: ClientStatus.SUSPENDED, label: 'Suspenso' },
  ];

  function handleSubmit(event: Event) {
    event.preventDefault();
    
    // Clear previous errors
    errors = {};

    // Validate form
    const validation = validateForm(clientSchema, formData);
    if (!validation.success) {
      errors = validation.errors;
      return;
    }

    // Dispatch submit event
    dispatch('submit', { data: formData });
  }

  function handleCancel() {
    dispatch('cancel');
  }

  function handlePhoneInput(event: Event) {
    const target = event.target as HTMLInputElement;
    const value = target.value.replace(/\D/g, '');
    
    if (value.length <= 11) {
      let formatted = value;
      if (value.length >= 2) {
        formatted = `(${value.slice(0, 2)}) ${value.slice(2)}`;
      }
      if (value.length >= 7) {
        formatted = `(${value.slice(0, 2)}) ${value.slice(2, 7)}-${value.slice(7)}`;
      }
      formData.phone = formatted;
    }
  }
</script>

<form onsubmit={handleSubmit} class="space-y-6">
  <FieldGroup>
    <!-- Basic Information -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Field>
        <FieldLabel for="name">Nome *</FieldLabel>
        <Input
          id="name"
          bind:value={formData.name}
          placeholder="Nome do cliente"
          class={getFieldError(errors, 'name') ? 'border-red-500' : ''}
          required
        />
        {#if getFieldError(errors, 'name')}
          <FieldError>{getFieldError(errors, 'name')}</FieldError>
        {/if}
      </Field>

      <Field>
        <FieldLabel for="email">Email *</FieldLabel>
        <Input
          id="email"
          type="email"
          bind:value={formData.email}
          placeholder="cliente@exemplo.com"
          class={getFieldError(errors, 'email') ? 'border-red-500' : ''}
          required
        />
        {#if getFieldError(errors, 'email')}
          <FieldError>{getFieldError(errors, 'email')}</FieldError>
        {/if}
      </Field>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Field>
        <FieldLabel for="phone">Telefone</FieldLabel>
        <Input
          id="phone"
          bind:value={formData.phone}
          placeholder="(11) 99999-9999"
          oninput={handlePhoneInput}
          class={getFieldError(errors, 'phone') ? 'border-red-500' : ''}
        />
        {#if getFieldError(errors, 'phone')}
          <FieldError>{getFieldError(errors, 'phone')}</FieldError>
        {/if}
      </Field>

      <Field>
        <FieldLabel for="status">Status</FieldLabel>
        <Select bind:value={formData.status}>
          <SelectTrigger class={getFieldError(errors, 'status') ? 'border-red-500' : ''}>
            <SelectValue placeholder="Selecione o status" />
          </SelectTrigger>
          <SelectContent>
            {#each statusOptions as option}
              <SelectItem value={option.value}>{option.label}</SelectItem>
            {/each}
          </SelectContent>
        </Select>
        {#if getFieldError(errors, 'status')}
          <FieldError>{getFieldError(errors, 'status')}</FieldError>
        {/if}
      </Field>
    </div>

    <!-- Address Information -->
    <div class="space-y-4">
      <h3 class="text-lg font-medium">Informações de Endereço</h3>
      
      <Field>
        <FieldLabel for="address">Endereço</FieldLabel>
        <Input
          id="address"
          bind:value={formData.address}
          placeholder="Rua, número, complemento"
          class={getFieldError(errors, 'address') ? 'border-red-500' : ''}
        />
        {#if getFieldError(errors, 'address')}
          <FieldError>{getFieldError(errors, 'address')}</FieldError>
        {/if}
      </Field>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Field>
          <FieldLabel for="city">Cidade</FieldLabel>
          <Input
            id="city"
            bind:value={formData.city}
            placeholder="Cidade"
            class={getFieldError(errors, 'city') ? 'border-red-500' : ''}
          />
          {#if getFieldError(errors, 'city')}
            <FieldError>{getFieldError(errors, 'city')}</FieldError>
          {/if}
        </Field>

        <Field>
          <FieldLabel for="state">Estado</FieldLabel>
          <Input
            id="state"
            bind:value={formData.state}
            placeholder="Estado"
            class={getFieldError(errors, 'state') ? 'border-red-500' : ''}
          />
          {#if getFieldError(errors, 'state')}
            <FieldError>{getFieldError(errors, 'state')}</FieldError>
          {/if}
        </Field>

        <Field>
          <FieldLabel for="zipCode">CEP</FieldLabel>
          <Input
            id="zipCode"
            bind:value={formData.zipCode}
            placeholder="00000-000"
            class={getFieldError(errors, 'zipCode') ? 'border-red-500' : ''}
          />
          {#if getFieldError(errors, 'zipCode')}
            <FieldError>{getFieldError(errors, 'zipCode')}</FieldError>
          {/if}
        </Field>
      </div>
    </div>

    <!-- Company Information -->
    <div class="space-y-4">
      <h3 class="text-lg font-medium">Informações da Empresa</h3>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field>
          <FieldLabel for="company">Empresa</FieldLabel>
          <Input
            id="company"
            bind:value={formData.company}
            placeholder="Nome da empresa"
            class={getFieldError(errors, 'company') ? 'border-red-500' : ''}
          />
          {#if getFieldError(errors, 'company')}
            <FieldError>{getFieldError(errors, 'company')}</FieldError>
          {/if}
        </Field>

        <Field>
          <FieldLabel for="contactPerson">Pessoa de Contato</FieldLabel>
          <Input
            id="contactPerson"
            bind:value={formData.contactPerson}
            placeholder="Nome da pessoa de contato"
            class={getFieldError(errors, 'contactPerson') ? 'border-red-500' : ''}
          />
          {#if getFieldError(errors, 'contactPerson')}
            <FieldError>{getFieldError(errors, 'contactPerson')}</FieldError>
          {/if}
        </Field>
      </div>
    </div>

    <!-- Notes -->
    <Field>
      <FieldLabel for="notes">Observações</FieldLabel>
      <textarea
        id="notes"
        bind:value={formData.notes}
        placeholder="Observações adicionais sobre o cliente"
        class="w-full min-h-[100px] px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 {getFieldError(errors, 'notes') ? 'border-red-500' : ''}"
      ></textarea>
      {#if getFieldError(errors, 'notes')}
        <FieldError>{getFieldError(errors, 'notes')}</FieldError>
      {/if}
    </Field>

    <!-- Actions -->
    <div class="flex justify-end gap-3 pt-4">
      {#if showCancel}
        <Button type="button" variant="outline" onclick={handleCancel}>
          {cancelText}
        </Button>
      {/if}
      <Button type="submit" disabled={isLoading}>
        {isLoading ? 'Salvando...' : submitText}
      </Button>
    </div>
  </FieldGroup>
</form>
