## 2024-05-24 - Canvas getImageData Loop Bottleneck
**Learning:** Calling `getImageData` inside a nested loop for individual pixels on an HTML Canvas is a severe performance bottleneck. It causes layout thrashing/memory overhead in the browser.
**Action:** Always fetch the entire canvas `getImageData(0, 0, width, height)` once before the loop and use array indexing `(y * width + x) * 4` to access individual pixel RGBA values.
