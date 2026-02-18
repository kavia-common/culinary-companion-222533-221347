import React from "react";
import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import { HelloWorld } from "../HelloWorld";

/**
 * Minimal render test to ensure the component can render under jsdom
 * without crashing (basic sanity check for the Remotion composition components).
 */
describe("HelloWorld", () => {
	it("renders without crashing", () => {
		const { container } = render(
			<HelloWorld
				titleText="Hello"
				titleColor="#000000"
				logoColor1="#ff0000"
				logoColor2="#00ff00"
			/>,
		);

		expect(container).toBeTruthy();
	});
});
