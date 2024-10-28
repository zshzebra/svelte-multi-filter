<script lang="ts">
	import { createMultiFilterStore } from '$lib/index.js';
	import FilterGroup from './FilterGroup.svelte';

	interface Product {
		category: string;
		color: string;
		size: string;
		price: number;
	}

	const products = [
		{ category: 'Shirt', color: 'Red', size: 'M', price: 29.99 },
		{ category: 'Shirt', color: 'Blue', size: 'L', price: 29.99 },
		{ category: 'Pants', color: 'Black', size: 'M', price: 49.99 }
	];

	const properties = {
		category: {
			name: 'Category',
			options: ['Shirt', 'Pants', 'Jacket']
		},
		color: {
			name: 'Color',
			options: ['Red', 'Blue', 'Black', 'White']
		},
		size: {
			name: 'Size',
			options: ['S', 'M', 'L', 'XL']
		}
	};

	const filter = createMultiFilterStore(products, properties);
	let filteredItems: Product[] = [];

	filter.subscribe((items) => {
		filteredItems = items;
	});
</script>

<div class="filters">
	{#each Object.entries(properties) as [key, property]}
		<FilterGroup
			name={property.name}
			options={property.options}
			value={filter.store[key]}
			availableOptions={filter.getAvailableOptions(key)}
			on:change={({ detail }) => filter.updateProperty(key, detail.value)}
		/>
	{/each}
</div>

<button on:click={() => filter.reset()}> Reset Filters </button>

<div class="results" role="region" aria-label="Filtered Results">
	<h3>Results ({filteredItems.length} items)</h3>
	<ul>
		{#each filteredItems as item}
			<li>{JSON.stringify(item)}</li>
		{/each}
	</ul>
</div>
