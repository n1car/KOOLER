import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { api } from "./api";

describe("certificate download API", () => {
  const originalCreateObjectURL = Object.getOwnPropertyDescriptor(
    window.URL,
    "createObjectURL",
  );
  const originalRevokeObjectURL = Object.getOwnPropertyDescriptor(
    window.URL,
    "revokeObjectURL",
  );

  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
    localStorage.clear();
    if (originalCreateObjectURL) {
      Object.defineProperty(window.URL, "createObjectURL", originalCreateObjectURL);
    } else {
      Reflect.deleteProperty(window.URL, "createObjectURL");
    }
    if (originalRevokeObjectURL) {
      Object.defineProperty(window.URL, "revokeObjectURL", originalRevokeObjectURL);
    } else {
      Reflect.deleteProperty(window.URL, "revokeObjectURL");
    }
  });

  it("downloads the PDF response using the existing certificate endpoint", async () => {
    const pdf = new Blob(["%PDF-1.4\n%%EOF"], { type: "application/pdf" });
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(pdf, {
        status: 200,
        headers: {
          "content-type": "application/pdf",
          "content-disposition": 'attachment; filename="certificate-KOOLER.pdf"',
        },
      }),
    );
    const downloadedBlobs: Blob[] = [];
    const createObjectURL = vi.fn((blob: Blob) => {
      downloadedBlobs.push(blob);
      return "blob:certificate";
    });
    const revokeObjectURL = vi.fn();
    let downloadName: string | null = null;
    const click = vi
      .spyOn(HTMLAnchorElement.prototype, "click")
      .mockImplementation(function (this: HTMLAnchorElement) {
        downloadName = this.download;
      });
    vi.stubGlobal("fetch", fetchMock);
    Object.defineProperty(window.URL, "createObjectURL", {
      configurable: true,
      value: createObjectURL,
    });
    Object.defineProperty(window.URL, "revokeObjectURL", {
      configurable: true,
      value: revokeObjectURL,
    });

    await api.certificates.download(42);

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining("/certificates/42/download"),
      expect.objectContaining({
        headers: expect.objectContaining({ Accept: "application/pdf" }),
      }),
    );
    expect(downloadedBlobs[0]?.type).toBe("application/pdf");
    expect(downloadedBlobs[0]?.size).toBeGreaterThan(0);
    expect(click).toHaveBeenCalledOnce();
    expect(downloadName).toBe("certificate-KOOLER.pdf");
    expect(revokeObjectURL).toHaveBeenCalledWith("blob:certificate");
  });
});
