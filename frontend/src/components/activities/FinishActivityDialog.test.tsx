import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { FinishActivityDialog } from "./FinishActivityDialog";

afterEach(cleanup);

describe("FinishActivityDialog", () => {
  it("does not submit the finish request when the organizer cancels", () => {
    const cancel = vi.fn();
    const finishRequest = vi.fn();

    render(
      <FinishActivityDialog
        enrolledCount={3}
        busy={false}
        onCancel={cancel}
        onConfirm={finishRequest}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Cancelar" }));

    expect(cancel).toHaveBeenCalledOnce();
    expect(finishRequest).not.toHaveBeenCalled();
  });

  it("submits only when the organizer confirms", () => {
    const cancel = vi.fn();
    const finishRequest = vi.fn();

    render(
      <FinishActivityDialog
        enrolledCount={3}
        busy={false}
        onCancel={cancel}
        onConfirm={finishRequest}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Sí, finalizar" }));

    expect(finishRequest).toHaveBeenCalledOnce();
    expect(cancel).not.toHaveBeenCalled();
  });
});
