import { writable, get } from "svelte/store";

export const sheetY = writable(85);
export const isDragging = writable(false);

let startClientY = 0;
let startSheetY = 85;
let ignoreClick = false;

export function handlePointerDown(e) {
    isDragging.set(true);
    startClientY = e.clientY;
    startSheetY = get(sheetY);
    e.target.setPointerCapture(e.pointerId);
}

export function handlePointerMove(e) {
    if (!get(isDragging)) return;
    const deltaY = e.clientY - startClientY;
    const deltaVh = (deltaY / window.innerHeight) * 100;
    sheetY.set(Math.max(5, Math.min(85, startSheetY + deltaVh)));
}

export function handlePointerUp(e) {
    if (!get(isDragging)) return;
    isDragging.set(false);
    
    if (e.target.hasPointerCapture && e.target.hasPointerCapture(e.pointerId)) {
        e.target.releasePointerCapture(e.pointerId);
    }

    const dragDistanceAbs = Math.abs(e.clientY - startClientY);

    ignoreClick = true;
    setTimeout(() => {
        ignoreClick = false;
    }, 50);

    if (dragDistanceAbs < 5) {
        sheetY.set(startSheetY > 50 ? 5 : 85);
        return;
    }

    const currentY = get(sheetY);
    if (startSheetY > 50) {
        sheetY.set(currentY < 70 ? 5 : 85);
    } else {
        sheetY.set(currentY > 20 ? 85 : 5);
    }
}

export function handleSidebarClick() {
    if (get(isDragging) || ignoreClick) return;
    if (get(sheetY) > 50) {
        sheetY.set(5);
    }
}