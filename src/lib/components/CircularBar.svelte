<script>
	import { run } from 'svelte/legacy';

	/** @type {{value?: number, color: any, trackColor: any, textColor: any, thickness?: string, decimals?: boolean}} */
	let {
		value = $bindable(0),
		color,
		trackColor,
		textColor,
		thickness = '5%',
		decimals = false
	} = $props();

	let newValue = $state(); // Value already validated
	let radius = $state(), xaxis = $state(), side;
	let circle = $state(), hidCircle = $state();
	let rootEle = $state();
	let rootWidth = $state(), rootHeight;
	let textLarge = $state(), percent = $state();
	let max = 100;
	let discRadius = 80;


	function calculate() {
		newValue = (value > max ? max : value < 0 ? 0 : value) || 0;

		if (circle && hidCircle) {
			let isPercent = thickness.slice(-1) == '%';
			let breadth = parseInt(thickness) || 5;
			let border = isPercent ? (breadth / 100) * rootWidth : breadth;

			// Discount the stroke thickness on both sides
			side = rootWidth;
			radius = (side - border * 2) / 2;
			xaxis = radius;

			// Colors
			if (color) {
				rootEle.style.setProperty('--def-circlebar-color', color);
			}
			if (trackColor) {
				rootEle.style.setProperty('--def-circlebar-track', trackColor);
			}
			if (textColor) {
				rootEle.style.setProperty('--def-circlebar-text', textColor);
			}

			// Bar graph
			let dashValue = Math.round(2 * Math.PI * radius);
			circle.style.strokeDashoffset = dashValue;
			circle.style.strokeDasharray = dashValue;

			circle.style.strokeWidth = border;
			circle.style.transform = `translate(${border}px, ${border}px)`;
			hidCircle.style.strokeWidth = border;
			hidCircle.style.transform = `translate(${border}px, ${border}px)`;

			// Decimals
			if (decimals) {
				newValue = Math.round((newValue + Number.EPSILON) * 100) / 100;
			} else {
				newValue = Math.round(newValue);
			}

			// Value for dashoffset
			circle.style.strokeDashoffset = dashValue - (dashValue * newValue) / 100;

			// Font sizes
			textLarge.style.fontSize = Math.max(radius / 2, 12) + 'px';
			percent.style.fontSize = Math.max(radius / 6, 10) + 'px';
		}
	}
	run(() => {
		calculate(value, rootWidth, rootHeight);
	});
</script>

<section bind:clientWidth={rootWidth} bind:this={rootEle} class="circle">
	<div class="container">
		<svg>
			<circle cx={xaxis} cy={radius} r={radius} bind:this={hidCircle}></circle>
			<circle cx={xaxis} cy={radius} r={radius} {color} bind:this={circle}></circle>
		</svg>
		<div class="info">
			<b bind:this={textLarge}>{newValue}</b><b bind:this={percent}>%</b>
		</div>
	</div>
</section>

<style>
	div.container {
		width: 100%;
		height: 0;
		padding-bottom: 100%;
	}
	section {
		position: relative;
		display: flex;
		justify-content: center;
		align-items: center;
		width: 100%;
		height: 100%;
		--def-circlebar-color: #dc143c;
		--def-circlebar-track: #223;
		--def-circlebar-text: #999;
	}

	svg {
		box-sizing: border-box;
		transform: rotate(270deg);
		position: absolute;
		width: 100%;
		height: 100%;
		top: 0;
		left: 0;
	}

	svg > circle {
		width: 100%;
		height: 100%;
		fill: transparent;
		stroke: var(--circlebar-track, var(--def-circlebar-track));
		transform: translate(5px, 5px);
		transition: all 0.2s ease;
	}

	svg > circle:nth-child(2) {
		stroke: var(--circlebar-color, var(--def-circlebar-color));
	}

	.info {
		position: absolute;
		font-weight: bold;
		color: var(--circlebar-text, var(--def-circlebar-text));
		text-transform: uppercase;
		left: 50%;
		top: 50%;
		transform: translate(-50%, -50%);
		white-space: pre-line;
	}
</style>
