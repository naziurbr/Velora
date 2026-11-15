export type ProductModelFormat = "glb" | "gltf";

export function validateProductModelBytes(bytes: Uint8Array, format: ProductModelFormat): string | null {
  let documentBytes = bytes;
  let binaryChunk: Uint8Array | null = null;
  if (format === "glb") {
    const data = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    if (
      bytes.length < 20 ||
      data.getUint32(0, true) !== 0x46546c67 ||
      data.getUint32(4, true) !== 2 ||
      data.getUint32(8, true) !== bytes.length
    ) {
      return "This is not a valid glTF 2.0 binary model.";
    }

    let offset = 12;
    let chunkIndex = 0;
    while (offset < bytes.length) {
      if (offset + 8 > bytes.length) return "This binary model contains an invalid chunk.";
      const chunkLength = data.getUint32(offset, true);
      const chunkType = data.getUint32(offset + 4, true);
      const chunkStart = offset + 8;
      const chunkEnd = chunkStart + chunkLength;
      if (chunkLength % 4 !== 0 || chunkEnd > bytes.length) {
        return "This binary model contains an invalid chunk.";
      }
      if (chunkIndex === 0 && chunkType !== 0x4e4f534a) {
        return "This binary model does not start with a glTF JSON chunk.";
      }
      if (chunkType === 0x4e4f534a) {
        if (documentBytes !== bytes || chunkLength < 1) {
          return "This binary model contains an invalid JSON chunk.";
        }
        documentBytes = bytes.subarray(chunkStart, chunkEnd);
      } else if (chunkType === 0x004e4942) {
        if (binaryChunk) return "This binary model contains multiple binary chunks.";
        binaryChunk = bytes.subarray(chunkStart, chunkEnd);
      }
      offset = chunkEnd;
      chunkIndex += 1;
    }
    if (documentBytes === bytes) {
      return "This binary model does not contain a valid glTF JSON chunk.";
    }
  }

  let document: unknown;
  try {
    document = JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(documentBytes));
  } catch {
    return format === "glb"
      ? "This binary model contains invalid glTF JSON."
      : "This is not a valid .gltf JSON model.";
  }

  if (
    typeof document !== "object" ||
    document === null ||
    !("asset" in document) ||
    typeof document.asset !== "object" ||
    document.asset === null ||
    !("version" in document.asset) ||
    document.asset.version !== "2.0"
  ) {
    return "Only glTF 2.0 models are supported.";
  }

  for (const resourceKey of ["buffers", "images"] as const) {
    if (!(resourceKey in document)) continue;
    const resources: unknown = Reflect.get(document, resourceKey);
    if (!Array.isArray(resources)) return "This model contains invalid resources.";
    for (const [index, resource] of resources.entries()) {
      if (typeof resource !== "object" || resource === null) {
        return "This model contains invalid resources.";
      }
      const hasEmbeddedUri =
        "uri" in resource && typeof resource.uri === "string" && /^data:[^,]*,/i.test(resource.uri);
      const hasEmbeddedBufferView =
        resourceKey === "images" &&
        "bufferView" in resource &&
        typeof resource.bufferView === "number" &&
        Number.isSafeInteger(resource.bufferView) &&
        resource.bufferView >= 0;
      const hasGlbBinary =
        format === "glb" &&
        resourceKey === "buffers" &&
        index === 0 &&
        binaryChunk !== null &&
        !("uri" in resource) &&
        "byteLength" in resource &&
        typeof resource.byteLength === "number" &&
        Number.isSafeInteger(resource.byteLength) &&
        resource.byteLength > 0 &&
        resource.byteLength <= binaryChunk.length &&
        binaryChunk.length - resource.byteLength <= 3;
      if (resourceKey === "buffers" && "uri" in resource && !hasEmbeddedUri) {
        return "This model uses separate files. Embed its buffers and textures, or upload it as a .glb.";
      }
      if (!hasEmbeddedUri && !hasEmbeddedBufferView && !hasGlbBinary) {
        return "This model uses separate files. Embed its buffers and textures, or upload it as a .glb.";
      }
    }
  }
  if (binaryChunk) {
    const buffers: unknown = "buffers" in document ? Reflect.get(document, "buffers") : null;
    const firstBuffer = Array.isArray(buffers) ? buffers[0] : null;
    if (
      typeof firstBuffer !== "object" ||
      firstBuffer === null ||
      "uri" in firstBuffer ||
      !("byteLength" in firstBuffer) ||
      typeof firstBuffer.byteLength !== "number" ||
      !Number.isSafeInteger(firstBuffer.byteLength) ||
      firstBuffer.byteLength < 1 ||
      firstBuffer.byteLength > binaryChunk.length ||
      binaryChunk.length - firstBuffer.byteLength > 3
    ) {
      return "This binary model contains unreferenced binary data.";
    }
  }
  return null;
}
