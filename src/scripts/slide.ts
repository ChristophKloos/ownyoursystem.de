import { writable, get, type Writable } from "svelte/store";

export const SHEET_CLOSED_Y = 78;
export const SNAP_THRESHOLD = 20;

export const sheetY: Writable<number> = writable(SHEET_CLOSED_Y);
export const isDragging: Writable<boolean> = writable(false);

let startClientY: number = 0;
let startSheetY: number = SHEET_CLOSED_Y;
let ignoreClick: boolean = false;

export function triggerBounce(): void {
    setTimeout(() => {
        sheetY.set(SHEET_CLOSED_Y - 4);
        setTimeout(() => {
            sheetY.set(SHEET_CLOSED_Y);
        }, 300);
    }, 800);
}

export function handlePointerDown(e: PointerEvent): void {
    isDragging.set(true);
    startClientY = e.clientY;
    startSheetY = get(sheetY);
    
    const target = e.target as HTMLElement;
    if (target.setPointerCapture) {
        target.setPointerCapture(e.pointerId);
    }
}

export function handlePointerMove(e: PointerEvent): void {
    if (!get(isDragging)) return;
    const deltaY = e.clientY - startClientY;
    const deltaVh = (deltaY / window.innerHeight) * 100;
    sheetY.set(Math.max(5, Math.min(85, startSheetY + deltaVh)));
}

export function handlePointerUp(e: PointerEvent): void {
    if (!get(isDragging)) return;
    isDragging.set(false);
    
    const target = e.target as HTMLElement;
    if (target.hasPointerCapture && target.hasPointerCapture(e.pointerId)) {
        target.releasePointerCapture(e.pointerId);
    }

    const dragDistanceAbs = Math.abs(e.clientY - startClientY);

    ignoreClick = true;
    setTimeout(() => {
        ignoreClick = false;
    }, 50);

    if (dragDistanceAbs < 5) {
        sheetY.set(startSheetY > 50 ? 5 : SHEET_CLOSED_Y);
        return;
    }

    const currentY = get(sheetY);
    if (startSheetY > 50) {
        sheetY.set(currentY < 70 ? 5 : SHEET_CLOSED_Y);
    } else {
        sheetY.set(currentY > SNAP_THRESHOLD ? SHEET_CLOSED_Y : 5);
    }
}

export function handleSidebarClick(): void {
    if (get(isDragging) || ignoreClick) return;
    if (get(sheetY) > 50) {
        sheetY.set(5);
    }
}