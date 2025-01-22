import type { Coordinates } from '$lib/types';
import sharp from 'sharp';

export async function getImageDimensions(bufferString: string) {
	const buffer = Buffer.from(bufferString, 'base64');
	const { width, height } = await sharp(buffer).metadata();
	return { width, height };
}
export function translateCoordinates(
    coordinates: Coordinates, 
    originalWidth: number, 
    maxWidth: number
): Coordinates {
    const { x1, y1, x2, y2 } = coordinates;
    const scale = originalWidth > maxWidth ? maxWidth / originalWidth : 1;

    return {
        x1: x1 / scale,
        y1: y1 / scale,
        x2: x2 / scale,
        y2: y2 / scale
    };
}
export function translateCoordinatesArray(
    coordinatesArray: Coordinates[], 
    originalWidth: number, 
    maxWidth: number
): Coordinates[] {
    return coordinatesArray.map(coordinates => 
        translateCoordinates(coordinates, originalWidth, maxWidth)
    );
}

export function doCoordinatesIntersect(
    array1: Coordinates[], 
    array2: Coordinates[]
): boolean {
    const isIntersecting = (box1: Coordinates, box2: Coordinates) => {
        return !(box2.x1 > box1.x2 || 
                 box2.x2 < box1.x1 || 
                 box2.y1 > box1.y2 || 
                 box2.y2 < box1.y1);
    };

    for (const box1 of array1) {
        for (const box2 of array2) {
            if (isIntersecting(box1, box2)) {
                return true;
            }
        }
    }
    return false;
}

