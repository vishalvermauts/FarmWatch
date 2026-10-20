## 2024-03-24 - Batch Canvas getImageData Readbacks
**Learning:** Calling `getImageData(x, y, 1, 1)` per pixel in a tight nested loop causes a massive performance hit due to repeated DOM/Canvas readbacks. This becomes a major bottleneck when computing large pixel grids for spatial heatmaps.
**Action:** Always batch canvas data reads using a single `ctx.getImageData(0, 0, width, height)` call before the loop and compute individual pixel values directly from the resulting `ImageData` array index `(y * width + x) * 4`.
