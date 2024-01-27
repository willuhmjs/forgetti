import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';
import "sharp";
export default defineConfig({
	plugins: [sveltekit()],
	test: {
		include: ['src/**/*.{test,spec}.{js,ts}']
	},
	assetsInclude: ['**/*.onnx', '**/*.json'],
	optimizeDeps: {
		exclude: ['sharp']
	}
});
