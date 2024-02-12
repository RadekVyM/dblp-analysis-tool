/**
 * Converts an iterator to a ReadableStream.
 * @param iterator Async iterator
 * @returns ReadableStream
 */
export function iteratorToStream(iterator: AsyncGenerator<any, any, any>) {
    return new ReadableStream({
        async pull(controller) {
            const { value, done } = await iterator.next();
            if (done) {
                controller.close();
            } else {
                controller.enqueue(value);
            }
        },
    });
}