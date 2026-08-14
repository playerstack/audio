import React from "react";
import { renderHook, act } from "@testing-library/react";

const useVolume = require("../../src/hooks/useVolume").default;

describe("useVolume", () => {
  it("provides changeVolume and onMutedClick", () => {
    const videoRef = { current: document.createElement("audio") };
    const updateState = jest.fn();
    const { result } = renderHook(() =>
      useVolume({ prevented: false, muted: false, videoRef, src: "test.mp3", updateState })
    );
    expect(result.current.changeVolume).toBeDefined();
    expect(result.current.onMutedClick).toBeDefined();
  });

  it("changeVolume updates state", () => {
    const el = document.createElement("audio");
    Object.defineProperty(el, "volume", { writable: true, value: 0.8 });
    Object.defineProperty(el, "muted", { writable: true, value: false });
    const videoRef = { current: el };
    const updateState = jest.fn();
    const { result } = renderHook(() =>
      useVolume({ prevented: false, muted: false, videoRef, src: "test.mp3", updateState })
    );

    act(() => {
      result.current.changeVolume(0.5);
    });

    expect(updateState).toHaveBeenCalledWith({ volume: 0.5, muted: false });
  });
});
