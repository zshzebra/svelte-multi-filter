/**
 * @fileoverview Multi-dimensional filter store for Svelte applications.
 * @version 1.0.0
 */

import { writable, derived } from 'svelte/store';

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
 * Result of the filter store containing filtered items
 * @template T The type of items being filtered
 */
export interface FilterResult<T> {
	/** Subscribe to store changes */
	subscribe: (callback: (value: T[]) => void) => () => void;
}

/**
 * Creates a multi-dimensional filter store
 *
 * @template T The type of items being filtered
 * @param {T[]} items Array of items to filter
 * @param {FilterConfig<T>} config Configuration object containing arrays of possible values for each dimension
 * @returns An object containing store subscription, filter operations, and derived values
 *
 * @example
 * ```typescript
 * interface Product {
 *   category: 'Shirt' | 'Pants';
 *   color: 'Red' | 'Blue';
 * }
 *
 * const products = [
 *   { category: 'Shirt', color: 'Red' },
 *   { category: 'Pants', color: 'Blue' }
 * ];
 *
 * const config = {
 *   category: ['Shirt', 'Pants'],
 *   color: ['Red', 'Blue']
 * };
 *
 * const filter = createFilterStore(products, config);
 * ```
 */
export function createFilterStore<T extends Record<string, unknown>>(
	items: T[],
	config: FilterConfig<T>
) {
	// Initialize dimensions with 'Any' selected
	const initialDimensions = Object.fromEntries(
		Object.entries(config).map(([key, options]) => [key, { options, selected: 'Any' as const }])
	) as { [K in keyof T]: FilterDimension<T[K]> };

	// Create the main store
	const store = writable(initialDimensions);

	/**
	 * Updates the selected value for a dimension
	 *
	 * @template K The key of the dimension being updated
	 * @param {K} dimension The dimension to update
	 * @param {T[K] | 'Any'} value The new value to set
	 */
	function select<K extends keyof T>(dimension: K, value: T[K] | 'Any') {
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
	 *
	 * @template K The key of the dimension to get options for
	 * @param {K} dimension The dimension to get options for
	 * @returns {FilterResult<T[K]>} A derived store containing available options
	 */
	function getAvailableOptions<K extends keyof T>(dimension: K) {
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
	 * @type {FilterResult<T>}
	 */
	const filteredItems = derived(store, ($store) =>
		items.filter((item) =>
			Object.entries($store).every(
				([key, dim]) => dim.selected === 'Any' || item[key] === dim.selected
			)
		)
	);

	/**
	 * Resets all selections to 'Any'
	 */
	function reset() {
		store.set(initialDimensions);
	}

	return {
		/** Subscribe to dimension state changes */
		subscribe: store.subscribe,
		/** Update a dimension's selected value */
		select,
		/** Get available options for a dimension */
		getAvailableOptions,
		/** Get filtered items based on current selections */
		filteredItems,
		/** Reset all selections to initial state */
		reset
	};
}
