<script lang="ts" generics="T extends PropertyValue">
	import { type PropertyValue } from '$lib/index.js';
	import { createEventDispatcher } from 'svelte';

	/** Name of the filter group */
	export let name: string;
	/** Available options for this filter */
	export let options: T[];
	/** Currently selected value */
	export let value: T | 'Any';
	/** Currently available options based on other selections */
	export let availableOptions: T[];

	const dispatch = createEventDispatcher<{
		change: { value: T | 'Any' };
	}>();

	const ANY_OPTION = 'Any' as const;

	/** @internal */
	function handleChange(newValue: T | 'Any') {
		dispatch('change', { value: newValue });
	}
</script>

<div class="filter-group" role="group" aria-labelledby="filter-{name}">
	<h3 id="filter-{name}">{name}</h3>
	<div class="options" role="radiogroup" aria-label={name}>
		<label class="radio-label">
			<input
				type="radio"
				{name}
				value={ANY_OPTION}
				checked={value === ANY_OPTION}
				on:change={() => handleChange(ANY_OPTION)}
				role="radio"
				aria-checked={value === ANY_OPTION}
			/>
			<span>Any</span>
		</label>
		{#each options as option}
			{@const isAvailable = availableOptions.includes(option)}
			<label class="radio-label">
				<input
					type="radio"
					{name}
					value={option}
					checked={value === option}
					disabled={!isAvailable}
					on:change={() => handleChange(option)}
					role="radio"
					aria-checked={value === option}
					aria-disabled={!isAvailable}
				/>
				<span class:disabled={!isAvailable}>
					{option}
				</span>
			</label>
		{/each}
	</div>
</div>

<style>
	.filter-group {
		margin-bottom: 1.5rem;
	}

	.options {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.radio-label {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		cursor: pointer;
	}

	.radio-label:has(input:disabled) {
		cursor: not-allowed;
	}

	.disabled {
		opacity: 0.5;
	}
</style>
