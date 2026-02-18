import React, { useEffect, useMemo, useState } from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { RecipesApi, RatingSummary, Recipe } from "../api/client";
import "../styles/retro.css";

type Props = {
	readonly query: string;
	readonly highlightTag?: string;
};

type LoadState =
	| { status: "idle" | "loading" }
	| { status: "loaded"; recipes: Recipe[]; ratingById: Record<string, RatingSummary> }
	| { status: "error"; message: string };

/**
 * A Remotion composition rendering a “Culinary Companion” retro-themed UI preview.
 */
export const CulinaryCompanion: React.FC<Props> = ({ query, highlightTag }) => {
	const frame = useCurrentFrame();

	const [state, setState] = useState<LoadState>({ status: "idle" });

	useEffect(() => {
		let cancelled = false;

		const run = async () => {
			try {
				setState({ status: "loading" });
				const recipes = await RecipesApi.list({ q: query });

				// Fetch rating summaries in parallel for top results only (keeps it snappy).
				const top = recipes.slice(0, 5);
				const ratings = await Promise.all(
					top.map(async (r) => {
						try {
							return await RecipesApi.ratingSummary(r.id);
						} catch {
							return { recipeId: r.id, average: 0, count: 0 };
						}
					}),
				);

				const ratingById: Record<string, RatingSummary> = {};
				for (const rr of ratings) {
					ratingById[rr.recipeId] = rr;
				}

				if (!cancelled) {
					setState({ status: "loaded", recipes, ratingById });
				}
			} catch (e) {
				const message = e instanceof Error ? e.message : "Failed to load recipes";
				if (!cancelled) {
					setState({ status: "error", message });
				}
			}
		};

		run();

		return () => {
			cancelled = true;
		};
	}, [query]);

	const opacity = interpolate(frame, [0, 18], [0, 1], {
		extrapolateLeft: "clamp",
		extrapolateRight: "clamp",
	});

	const view = useMemo(() => {
		switch (state.status) {
			case "idle":
			case "loading":
				return { kind: "loading" as const };
			case "error":
				return { kind: "error" as const, message: state.message };
			case "loaded":
				return {
					kind: "loaded" as const,
					recipes: state.recipes,
					ratingById: state.ratingById,
				};
			default: {
				// Exhaustiveness guard (should be unreachable)
				const _exhaustive: never = state;
				return _exhaustive;
			}
		}
	}, [state]);

	const selected = view.kind === "loaded" ? view.recipes[0] : null;
	const rating =
		selected && view.kind === "loaded" ? view.ratingById[selected.id] : undefined;

	return (
		<AbsoluteFill className="retroApp" style={{ opacity }}>
			<div className="retroGrid" />
			<div className="retroTopbar">
				<div className="brand">
					<h1 className="brandTitle">Culinary Companion</h1>
					<p className="brandSubtitle">Browse • Save • Shop • Cook</p>
				</div>

				<div className="searchPill" aria-label="Search bar preview">
					<span className="searchLabel">Search:</span>
					<span className="searchLabel" style={{ opacity: 0.9 }}>
						{query.length ? `"${query}"` : "“nachos”"}
					</span>
					<div className="badgeRow" aria-label="Quick filters">
						<span className="badge badgePink">Favorites</span>
						<span className="badge badgeCyan">Tags</span>
						<span className="badge badgeGreen">Shopping</span>
					</div>
				</div>
			</div>

			<div className="columns">
				<div className="panel" aria-label="Recipe details">
					<p className="panelTitle">Now Cooking</p>

					{view.kind === "loading" ? (
						<div className="card">
							<div className="cardImage" />
							<div>
								<h2 className="cardTitle">Loading recipes…</h2>
								<p className="cardDesc">
									Fetching from backend API. If this hangs, verify the backend is running.
								</p>
								<div className="metaRow">
									<span className="pill">/api/recipes</span>
									<span className="pill">Retro theme</span>
								</div>
							</div>
						</div>
					) : view.kind === "error" ? (
						<div className="card">
							<div className="cardImage" />
							<div>
								<h2 className="cardTitle">API error</h2>
								<p className="cardDesc">{view.message}</p>
								<div className="metaRow">
									<span className="pill">Check CORS / URL</span>
									<span className="pill">Backend: :3001</span>
								</div>
							</div>
						</div>
					) : selected ? (
						<>
							<div className="card">
								<div className="cardImage" aria-label="Recipe image">
									{selected.photoUrl ? <img src={selected.photoUrl} alt={selected.title} /> : null}
									<div className="cardImageOverlay" />
								</div>
								<div>
									<h2 className="cardTitle">{selected.title}</h2>
									<p className="cardDesc">
										{selected.description ?? "A tasty recipe from the Culinary Companion collection."}
									</p>

									<div className="metaRow" aria-label="Metadata">
										<span className="pill">
											Rating: {rating ? rating.average.toFixed(1) : "0.0"} (
											{rating ? rating.count : 0})
										</span>
										<span className="pill">
											Ingredients: {selected.ingredients?.length ?? 0}
										</span>
										<span className="pill">Steps: {selected.steps?.length ?? 0}</span>
										{highlightTag ? <span className="pill">Tag: {highlightTag}</span> : null}
									</div>
								</div>
							</div>

							<div className="divider" />

							<p className="panelTitle">Step-by-step</p>
							<div className="stepList" aria-label="Steps list">
								{(selected.steps ?? []).slice(0, 5).map((s: string, idx: number) => (
									<div className="step" key={`${idx}-${s}`}>
										<div className="stepNum">{idx + 1}</div>
										<div className="stepText">{s}</div>
									</div>
								))}
							</div>
						</>
					) : (
						<div className="card">
							<div className="cardImage" />
							<div>
								<h2 className="cardTitle">No recipes found</h2>
								<p className="cardDesc">Try a different search query.</p>
							</div>
						</div>
					)}
				</div>

				<div className="panel" aria-label="Sidebar">
					<p className="panelTitle">Explore</p>

					<div className="sideSection">
						<div>
							<p className="panelTitle">Categories</p>
							<div className="smallList">
								<div className="smallItem">
									<p className="smallItemTitle">Snacks</p>
									<p className="smallItemSub">Quick, crunchy, shareable.</p>
								</div>
								<div className="smallItem">
									<p className="smallItemTitle">Dinner</p>
									<p className="smallItemSub">Comfort food classics.</p>
								</div>
								<div className="smallItem">
									<p className="smallItemTitle">Dessert</p>
									<p className="smallItemSub">Sweet retro indulgence.</p>
								</div>
							</div>
						</div>

						<div>
							<p className="panelTitle">Shopping list</p>
							<div className="smallList">
								<div className="smallItem">
									<p className="smallItemTitle">Auto-build</p>
									<p className="smallItemSub">
										Add ingredients from any recipe to your list.
									</p>
								</div>
								<div className="smallItem">
									<p className="smallItemTitle">Checklist</p>
									<p className="smallItemSub">Mark items as you shop.</p>
								</div>
							</div>
						</div>

						<div>
							<p className="panelTitle">Favorites</p>
							<div className="smallList">
								<div className="smallItem">
									<p className="smallItemTitle">Heart recipes</p>
									<p className="smallItemSub">
										Save go-to meals for the next cooking session.
									</p>
								</div>
							</div>
						</div>

						<div>
							<p className="panelTitle">API</p>
							<div className="smallList">
								<div className="smallItem">
									<p className="smallItemTitle">Swagger UI</p>
									<p className="smallItemSub">/swagger-ui.html</p>
								</div>
								<div className="smallItem">
									<p className="smallItemTitle">Docs JSON</p>
									<p className="smallItemSub">/api-docs</p>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>

			<div className="footerHint">
				Press “Render” to export • Data from backend API • Retro neon UI
			</div>
		</AbsoluteFill>
	);
};
