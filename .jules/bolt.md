## 2026-10-13 - Canvas `getImageData` Bottleneck
**Learning:** Calling `getImageData` inside a nested loop inside a `useMemo` for every pixel (or grid cell) is a massive performance bottleneck because every call involves traversing browser boundary crossings and potential re-allocations.
**Action:** Extract the `getImageData` call to outside the loop to get the entire image data once (e.g. `ctx.getImageData(0, 0, width, height)`), then read from the returned array using `index = (y * width + x) * 4`.
