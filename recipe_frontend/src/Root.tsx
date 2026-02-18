import React from "react";
import { Composition } from "remotion";
import { z } from "zod";
import { CulinaryCompanion } from "./CulinaryCompanion/CulinaryCompanion";

/**
 * Remotion compositions entrypoint.
 */
export const RemotionRoot: React.FC = () => {
	return (
		<>
			<Composition
				id="CulinaryCompanion"
				component={CulinaryCompanion}
				durationInFrames={240}
				fps={30}
				width={1920}
				height={1080}
				schema={z.object({
					query: z.string().default("nachos"),
					highlightTag: z.string().optional(),
				})}
				defaultProps={{
					query: "nachos",
					highlightTag: "retro",
				}}
			/>
		</>
	);
};
