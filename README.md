# Svelte Multi-Filter Store

A lightweight, type-safe multi-dimensional filter store for Svelte applications. This package provides a reactive way to handle complex filtering scenarios with multiple interdependent criteria.

## Features

- 🎯 **Type-safe**: Built with TypeScript for robust type checking
- ⚡ **Reactive**: Powered by Svelte stores for automatic updates
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
import { createMultiFilterStore } from 'svelte-multi-filter-store';

// Define your data structure
interface Product {
	category: string;
	color: string;
	size: string;
}

// Your data
const products = [
	{ category: 'Shirt', color: 'Red', size: 'M' },
	{ category: 'Pants', color: 'Blue', size: 'L' }
];

// Configure filter properties
const properties = {
	category: {
		name: 'Category',
		options: ['Shirt', 'Pants', 'Jacket']
	},
	color: {
		name: 'Color',
		options: ['Red', 'Blue', 'Black']
	}
};

// Create the filter store
const filterStore = createMultiFilterStore(products, properties);
```

## Usage in Svelte Components

```svelte
<script lang="ts">
	// Create store as shown above
	let filteredItems: Product[] = [];

	// Subscribe to filtered items changes
	filterStore.subscribe((items) => {
		filteredItems = items;
	});

	// Get available options for a specific property
	$: categoryOptions = filterStore.getAvailableOptions('category');
	$: colorOptions = filterStore.getAvailableOptions('color');

	// Update a property value
	function updateCategory(value: string) {
		filterStore.updateProperty('category', value);
	}
</script>

<!-- Implement your own filter UI components -->
<div class="filters">
	<!-- Example of a basic filter group -->
	<div class="filter-group">
		<h3>Category</h3>
		<label>
			<input
				type="radio"
				name="category"
				value="Any"
				checked={$filterStore.store['category'] === 'Any'}
				on:change={() => updateCategory('Any')}
			/>
			Any
		</label>
		{#each categoryOptions as option}
			<label>
				<input
					type="radio"
					name="category"
					value={option}
					checked={$filterStore.store['category'] === option}
					on:change={() => updateCategory(option)}
				/>
				{option}
			</label>
		{/each}
	</div>
</div>

<!-- Results -->
<div class="results">
	<h3>Results ({filteredItems.length} items)</h3>
	<ul>
		{#each filteredItems as item}
			<li>{JSON.stringify(item)}</li>
		{/each}
	</ul>
</div>
```

## API Reference

### `createMultiFilterStore<T>`

Creates a new filter store for items of type `T`.

```typescript
function createMultiFilterStore<T extends Record<string, PropertyValue>>(
	items: T[],
	properties: { [K in keyof Partial<T>]: FilterProperty<T[K]> }
): FilterStore<T>;
```

#### Parameters

- `items`: Array of items to filter
- `properties`: Configuration object for filter properties

#### Returns

A `FilterStore` object with the following methods and properties:

- `store`: Svelte writable store containing current filter state
- `getAvailableOptions(propertyName: string)`: Get available options for a property
- `getFilteredItems()`: Get current filtered items
- `updateProperty(propertyName: string, value: PropertyValue | 'Any')`: Update a filter
- `reset()`: Reset all filters to 'Any'
- `subscribe(callback: (items: T[]) => void)`: Subscribe to filtered items changes

### Types

```typescript
type PropertyValue = string | number;

interface FilterProperty<T extends PropertyValue> {
	name: string;
	options: T[];
}

interface FilterState {
	[key: string]: PropertyValue | 'Any';
}
```

## Example Implementation Patterns

### Basic Filter Group

```svelte
<script lang="ts">
	export let name: string;
	export let options: string[];
	export let value: string | 'Any';
	export let availableOptions: string[];

	function handleChange(newValue: string | 'Any') {
		filterStore.updateProperty(name, newValue);
	}
</script>

<div class="filter-group">
	<h3>{name}</h3>
	<div class="options">
		<label>
			<input
				type="radio"
				{name}
				value="Any"
				checked={value === 'Any'}
				on:change={() => handleChange('Any')}
			/>
			Any
		</label>
		{#each options as option}
			{@const isAvailable = availableOptions.includes(option)}
			<label class:disabled={!isAvailable}>
				<input
					type="radio"
					{name}
					value={option}
					checked={value === option}
					disabled={!isAvailable}
					on:change={() => handleChange(option)}
				/>
				{option}
			</label>
		{/each}
	</div>
</div>
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
