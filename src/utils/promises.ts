/**
 * Creates a delay Promise
 * @param milliseconds  
 * @returns Promise
 */
export async function delay(milliseconds: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, milliseconds));
}