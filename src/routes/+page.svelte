<script lang="ts">
	import { createFilterStore, type FilterConfig, type FilterDimension } from '$lib/index.js';

	const products = [
		{ category: 'Shirt', color: 'Red' },
		{ category: 'Pants', color: 'Blue' },
		{ category: 'Shirt', color: 'Black' }
	];

	interface Product extends Record<string, unknown> {
		category: 'Shirt' | 'Pants' | 'Jacket';
		color: 'Red' | 'Blue' | 'Black';
	}

	const config = {
		category: ['Shirt', 'Pants', 'Jacket'],
		color: ['Red', 'Blue', 'Black']
	} satisfies FilterConfig<Product>;

	const filter = createFilterStore(products, config);

	// State for dimensions and results
	let dimensions = $state<{
		category: FilterDimension<string>;
		color: FilterDimension<string>;
	}>();
	let results = $state<Product[]>([]);
	let availableCategoryOptions = $state<string[]>([]);
	let availableColorOptions = $state<string[]>([]);

	// Subscribe to store changes
	filter.subscribe((dims) => {
		dimensions = dims;
	});

	// Subscribe to filtered items
	filter.filteredItems.subscribe((items) => {
		results = items as Product[];
	});

	// Subscribe to available options
	filter.getAvailableOptions('category').subscribe((options) => {
		availableCategoryOptions = options;
	});

	filter.getAvailableOptions('color').subscribe((options) => {
		availableColorOptions = options;
	});
</script>

<div class="filters">
	<!-- Category Filter -->
	<div class="filter-group">
		<h3>Category</h3>
		<label>
			<input
				type="radio"
				name="category"
				value="Any"
				checked={dimensions?.category?.selected === 'Any'}
				onchange={() => filter.select('category', 'Any')}
			/>
			Any
		</label>

		{#each config.category as option}
			<label>
				<input
					type="radio"
					name="category"
					value={option}
					checked={dimensions?.category?.selected === option}
					disabled={!availableCategoryOptions.includes(option)}
					onchange={() => filter.select('category', option)}
				/>
				{option}
			</label>
		{/each}
	</div>

	<!-- Color Filter -->
	<div class="filter-group">
		<h3>Color</h3>
		<label>
			<input
				type="radio"
				name="color"
				value="Any"
				checked={dimensions?.color?.selected === 'Any'}
				onchange={() => filter.select('color', 'Any')}
			/>
			Any
		</label>

		{#each config.color as option}
			<label>
				<input
					type="radio"
					name="color"
					value={option}
					checked={dimensions?.color?.selected === option}
					disabled={!availableColorOptions.includes(option)}
					onchange={() => filter.select('color', option)}
				/>
				{option}
			</label>
		{/each}
	</div>
</div>

<button onclick={() => filter.reset()}>Reset Filters</button>

<div class="results">
	<h3>Results ({results.length})</h3>
	{#each results as item}
		<div>{JSON.stringify(item)}</div>
	{/each}
</div>
