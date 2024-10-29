/**
 * @fileoverview Multi-dimensional filter store for Svelte applications.
 * @version 1.0.0
 */

import { writable, derived, type Writable } from 'svelte/store';

/**
 * Represents a value that can be used as a filter dimension's option
 * @template T The type of the option value
 */
export type FilterDimension<T> = {
	/** Available options for this dimension */
	options: T[];
	/** Currently selected value, can be a specific option or 'Any' */
	selected: T | 'Any';
};

/**
 * Configuration object defining the possible values for each filter dimension
 * @template T The type containing the filter dimensions
 */
export type FilterConfig<T extends Record<string, unknown>> = {
	/** Array of possible values for each dimension */
	[K in keyof T]: T[K][];
};

/**
 * Store subscription type
 */
export type StoreSubscription<T> = {
	subscribe: (callback: (value: T) => void) => () => void;
};

/**
 * Filter store return type
 */
export type FilterStore<T extends Record<string, unknown>> = {
	subscribe: (
		callback: (dimensions: { [K in keyof T]: FilterDimension<T[K]> }) => void
	) => () => void;
	select: <K extends keyof T>(dimension: K, value: T[K] | 'Any') => void;
	getAvailableOptions: <K extends keyof T>(dimension: K) => StoreSubscription<T[K][]>;
	filteredItems: StoreSubscription<T[]>;
	reset: () => void;
};

/**
 * Creates a multi-dimensional filter store
 *
 * @template T The type of items being filtered
 * @param {T[]} items Array of items to filter
 * @param {FilterConfig<T>} config Configuration object containing arrays of possible values for each dimension
 * @returns {FilterStore<T>} Store and methods for filtering
 */
export function createFilterStore<T extends Record<string, unknown>>(
	items: T[],
	config: FilterConfig<T>
): FilterStore<T> {
	// Initialize dimensions with 'Any' selected
	const initialDimensions: { [K in keyof T]: FilterDimension<T[K]> } = Object.fromEntries(
		Object.entries(config).map(([key, options]) => [key, { options, selected: 'Any' as const }])
	) as { [K in keyof T]: FilterDimension<T[K]> };

	// Create the main store
	const store: Writable<typeof initialDimensions> = writable(initialDimensions);

	/**
	 * Updates the selected value for a dimension
	 */
	function select<K extends keyof T>(dimension: K, value: T[K] | 'Any'): void {
		store.update((dims) => ({
			...dims,
			[dimension]: {
				...dims[dimension],
				selected: value
			}
		}));
	}

	/**
	 * Gets a derived store of available options for a dimension
	 */
	function getAvailableOptions<K extends keyof T>(dimension: K): StoreSubscription<T[K][]> {
		return derived(store, ($store) => {
			const otherDimensions = Object.entries($store)
				.filter(([key]) => key !== dimension)
				.map(([key, dim]) => ({
					key,
					selected: dim.selected
				}));

			const availableItems = items.filter((item) =>
				otherDimensions.every(({ key, selected }) => selected === 'Any' || item[key] === selected)
			);

			const possibleValues = [...new Set(availableItems.map((item) => item[dimension]))] as T[K][];

			return config[dimension].filter((option) => possibleValues.includes(option as T[K]));
		});
	}

	/**
	 * Derived store containing filtered items based on current selections
	 */
	const filteredItems: StoreSubscription<T[]> = derived(store, ($store) =>
		items.filter((item) =>
			Object.entries($store).every(
				([key, dim]) => dim.selected === 'Any' || item[key] === dim.selected
			)
		)
	);

	/**
	 * Resets all selections to 'Any'
	 */
	function reset(): void {
		store.set(initialDimensions);
	}

	return {
		subscribe: store.subscribe,
		select,
		getAvailableOptions,
		filteredItems,
		reset
	};
}
