import React from "react";
import { render } from "@testing-library/react";

jest.mock("react-fast-compare", () => ({
  __esModule: true,
  default: (a, b) => JSON.stringify(a) === JSON.stringify(b),
}));

const { createAudioPlayer } = require("../src/AudioMediaPlayer/createAudioPlayer");

const mockPlayer = {
  key: "core",
  name: "PlayerCore",
  canPlay: () => true,
  lazyPlayer: React.forwardRef(function MockPlayer(props, ref) {
    return React.createElement("audio", { "data-testid": "audio-element" });
  }),
};

const AudioPlayer = createAudioPlayer(mockPlayer);

describe("AudioPlayer", () => {
  it("has canPlay static method", () => {
    expect(AudioPlayer.canPlay).toBeDefined();
    expect(AudioPlayer.canPlay("test.mp3")).toBe(true);
  });

  it("has displayName", () => {
    expect(AudioPlayer.displayName).toBe("AudioPlayer");
  });

  it("has default props", () => {
    expect(AudioPlayer.defaultProps).toBeDefined();
    expect(AudioPlayer.defaultProps.playing).toBe(false);
    expect(AudioPlayer.defaultProps.loop).toBe(false);
    expect(AudioPlayer.defaultProps.playbackRate).toBe(1);
  });

  it("renders wrapper element", () => {
    const { container } = render(React.createElement(AudioPlayer, { url: "" }));
    expect(container.querySelector(".playerstack-audio")).toBeInTheDocument();
  });
});
