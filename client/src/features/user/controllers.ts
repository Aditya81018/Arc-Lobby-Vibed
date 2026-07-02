import { faker } from '@faker-js/faker';

export function getRandomName() {
	return faker.person.firstName();
}

export function getRandomEmoji() {
	return faker.internet.emoji({ types: ['smiley'] });
}

export const baseColors = [
	{ h: 43, s: 90 }, // Warm Yellow
	{ h: 343, s: 85 }, // Rose Pink
	{ h: 166, s: 65 }, // Mint
	{ h: 255, s: 70 }, // Purple/Lavender
	{ h: 15, s: 80 }, // Peach/Coral
	{ h: 200, s: 80 }, // Sky Blue
	{ h: 100, s: 45 }, // Sage Green
	{ h: 142, s: 65 }, // Soft Emerald
	{ h: 180, s: 70 }, // Teal
	{ h: 275, s: 55 }, // Lilac
	{ h: 328, s: 70 }, // Raspberry
	{ h: 230, s: 65 }, // Deep Indigo
	{ h: 35, s: 85 }, // Amber
	{ h: 120, s: 50 }, // Forest Green
	{ h: 300, s: 55 }, // Orchid Plum
	{ h: 48, s: 85 }, // Butter Yellow
	{ h: 215, s: 60 }, // Slate Blue
	{ h: 188, s: 80 }, // Electric Cyan
	{ h: 25, s: 75 }, // Terracotta
	{ h: 290, s: 60 } // Fuchsia
];

export const presetColors = baseColors.map((color) => {
	const sVal = color.s;
	return {
		foregroundLight: `hsl(${color.h}, ${sVal}%, 38%)`,
		foregroundDark: `hsl(${color.h}, 95%, 72%)`,
		backgroundLight: `hsl(${color.h}, ${sVal}%, 82%)`,
		backgroundDark: `hsl(${color.h}, ${Math.max(sVal - 15, 40)}%, 50%)`,
		pickerColor: `hsl(${color.h}, 85%, 55%)`
	};
});

export function getRandomColor() {
	const randomIndex = Math.floor(Math.random() * presetColors.length);
	return presetColors[randomIndex];
}
