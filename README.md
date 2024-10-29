# Svelte Multi-Filter Store

A lightweight, type-safe multi-dimensional filter store for Svelte 5 applications. This package provides a reactive way to handle complex filtering scenarios with multiple interdependent criteria.

## Features

- 🎯 **Type-safe**: Built with TypeScript for robust type checking
- ⚡ **Reactive**: Built for Svelte 5 with runes
- 🔄 **Interdependent Filters**: Smart handling of filter dependencies
- 🎨 **Framework Agnostic UI**: Bring your own components
- 📦 **Zero Dependencies**: Only requires Svelte as a peer dependency

## Installation

Using Bun (recommended):

```bash
bunx jsr add @zshzebra/svelte-multi-filter
```

Using npm:

```bash
npx jsr add @zshzebra/svelte-multi-filter
```

Using pnpm:

```bash
pnpm dlx jsr add @zshzebra/svelte-multi-filter
```

## Quick Start

```typescript
import { createFilterStore, type FilterConfig } from '@zshzebra/svelte-multi-filter';

// Define your data structure
interface Product {
	category: 'Shirt' | 'Pants' | 'Jacket';
	color: 'Red' | 'Blue' | 'Black';
}

// Your data
const products = [
	{ category: 'Shirt', color: 'Red' },
	{ category: 'Pants', color: 'Blue' },
	{ category: 'Shirt', color: 'Black' }
];

// Configure filter options
const config = {
	category: ['Shirt', 'Pants', 'Jacket'],
	color: ['Red', 'Blue', 'Black']
} satisfies FilterConfig<Product>;

// Create the filter store
const filter = createFilterStore(products, config);
```

## Usage in Svelte 5 Components

```svelte
<script lang="ts">
	import {
		createFilterStore,
		type FilterConfig,
		type FilterDimension
	} from '@zshzebra/svelte-multi-filter';

	interface Product {
		category: 'Shirt' | 'Pants' | 'Jacket';
		color: 'Red' | 'Blue' | 'Black';
	}

	const products = [
		{ category: 'Shirt', color: 'Red' },
		{ category: 'Pants', color: 'Blue' },
		{ category: 'Shirt', color: 'Black' }
	];

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
		results = items;
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
```

## API Reference

### `createFilterStore<T>`

Creates a new filter store for items of type `T`.

```typescript
function createFilterStore<T extends Record<string, any>>(
	items: T[],
	config: FilterConfig<T>
): FilterStore<T>;
```

#### Parameters

- `items`: Array of items to filter
- `config`: Configuration object containing arrays of possible values for each dimension

#### Returns

A filter store object with the following methods and properties:

- `subscribe`: Subscribe to dimension state changes
- `select`: Update a dimension's selected value
- `getAvailableOptions`: Get a derived store of available options for a dimension
- `filteredItems`: Derived store of filtered items based on current selections
- `reset`: Reset all selections to 'Any'

### Types

```typescript
export type FilterDimension<T> = {
	options: T[];
	selected: T | 'Any';
};

export type FilterConfig<T extends Record<string, any>> = {
	[K in keyof T]: T[K][];
};
```

## TypeScript Support

The package is written in TypeScript and includes full type definitions. Generic types allow for type-safe filtering of your data structures.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

MIT License - see the [LICENSE](LICENSE) file for details
