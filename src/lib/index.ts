/**
 * @file MultiFilterStore.ts
 * @description A reactive multi-dimensional filter store for Svelte applications
 * @version 1.0.0
 */

import { writable, type Writable } from 'svelte/store';

/** Represents a value that can be used as a filter property */
export type PropertyValue = string | number;

/** Configuration for a filter property */
export interface FilterProperty<T extends PropertyValue> {
	/** Display name for the property */
	name: string;
	/** Available options for this property */
	options: T[];
}

/** Current state of the filter selections */
export interface FilterState {
	[key: string]: PropertyValue | 'Any';
}

/** Result of creating a filter store */
export interface FilterStore<T extends Record<string, PropertyValue>> {
	/** Svelte store containing the current filter state */
	store: Writable<FilterState>;
	/** Get available options for a specific property based on current selections */
	getAvailableOptions: (propertyName: string) => PropertyValue[];
	/** Get items filtered according to current selections */
	getFilteredItems: () => T[];
	/** Update the value of a specific property */
	updateProperty: (propertyName: string, value: PropertyValue | 'Any') => void;
	/** Reset all filters to 'Any' */
	reset: () => void;
	/** Subscribe to filtered items changes */
	subscribe: (callback: (items: T[]) => void) => () => void;
}

/**
 * Creates a multi-dimensional filter store
 *
 * @template T - The type of items being filtered
 * @param {T[]} items - Array of items to filter
 * @param {{ [K in keyof Partial<T>]: FilterProperty<T[K]> }} properties - Configuration for each filter property
 * @returns {FilterStore<T>} A filter store with methods for managing filters and accessing filtered items
 *
 * @example
 * ```typescript
 * interface Product {
 *   category: string;
 *   color: string;
 *   size: string;
 * }
 *
 * const products = [
 *   { category: 'Shirt', color: 'Red', size: 'M' },
 *   { category: 'Pants', color: 'Blue', size: 'L' }
 * ];
 *
 * const properties = {
 *   category: {
 *     name: 'Category',
 *     options: ['Shirt', 'Pants', 'Jacket']
 *   },
 *   color: {
 *     name: 'Color',
 *     options: ['Red', 'Blue', 'Black']
 *   }
 * };
 *
 * const filterStore = createMultiFilterStore(products, properties);
 * ```
 */
export function createMultiFilterStore<T extends Record<string, PropertyValue>>(
	items: T[],
	properties: { [K in keyof Partial<T>]: FilterProperty<T[K]> }
): FilterStore<T> {
	const ANY_OPTION = 'Any' as const;

	// Initialize state
	const initialState: FilterState = Object.keys(properties).reduce(
		(acc, key) => ({
			...acc,
			[key]: ANY_OPTION
		}),
		{}
	);

	// Create store
	const filterStore = writable<FilterState>(initialState);
	let currentState = initialState;

	// Store subscription
	filterStore.subscribe((value) => {
		currentState = value;
	});

	/**
	 * Gets all existing values for a property from the data
	 * @internal
	 */
	function getExistingValues(propertyName: string): PropertyValue[] {
		return [...new Set(items.map((item) => item[propertyName]))];
	}

	/**
	 * Gets available options for a property based on current selections
	 * @param propertyName - Name of the property to get options for
	 * @returns Array of available options
	 */
	function getAvailableOptions(propertyName: string): PropertyValue[] {
		const property = properties[propertyName];
		if (!property) return [];

		const existingValues = getExistingValues(propertyName);

		const otherProperties = Object.keys(currentState).filter((key) => key !== propertyName);
		const allOthersAny = otherProperties.every((prop) => currentState[prop] === ANY_OPTION);

		if (allOthersAny) {
			return property.options.filter((option) => existingValues.includes(option));
		}

		const filteredItems = items.filter((item) => {
			return Object.entries(currentState).every(([key, value]) => {
				if (key === propertyName || value === ANY_OPTION) return true;
				return item[key] === value;
			});
		});

		const availableOptions = [...new Set(filteredItems.map((item) => item[propertyName]))];
		return property.options.filter((option) => availableOptions.includes(option));
	}

	/**
	 * Gets items filtered according to current selections
	 * @returns Filtered array of items
	 */
	function getFilteredItems(): T[] {
		return items.filter((item) => {
			return Object.entries(currentState).every(([key, value]) => {
				return value === ANY_OPTION || item[key] === value;
			});
		});
	}

	/**
	 * Updates the value of a specific property
	 * @param propertyName - Name of the property to update
	 * @param value - New value for the property
	 */
	function updateProperty(propertyName: string, value: PropertyValue | typeof ANY_OPTION): void {
		filterStore.update((state) => {
			const newState = { ...state, [propertyName]: value };

			// Reset invalid selections
			Object.keys(state).forEach((key) => {
				if (key === propertyName) return;

				const availableOptions = getAvailableOptions(key);
				if (newState[key] !== ANY_OPTION && !availableOptions.includes(newState[key])) {
					newState[key] = ANY_OPTION;
				}
			});

			return newState;
		});
	}

	/**
	 * Resets all filters to 'Any'
	 */
	function reset(): void {
		filterStore.set(initialState);
	}

	/**
	 * Subscribes to filtered items changes
	 * @param callback - Function to call when filtered items change
	 * @returns Unsubscribe function
	 */
	function subscribe(callback: (items: T[]) => void) {
		return filterStore.subscribe(() => {
			callback(getFilteredItems());
		});
	}

	return {
		store: filterStore,
		getAvailableOptions,
		getFilteredItems,
		updateProperty,
		reset,
		subscribe
	};
}
