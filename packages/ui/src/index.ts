// Core WDS primitives
export * from "./alert";
export * from "./badge";
export * from "./button";
export * from "./card";
export * from "./cn";
export * from "./data-table";
export * from "./empty-state";
export * from "./field";
export * from "./kpi-card";
export * from "./page-header";
export * from "./pagination";
export * from "./section-heading";
export * from "./segmented";
// `Select` intentionally re-exported from `./field` (see packages/ui/src/select.tsx for the rationale).
export * from "./skeleton";
export * from "./status-badge";
export * from "./tabs";

// Shadcn-derived primitives (flat, no `./components/` layer)
export * from "./accordion";
export * from "./dialog";
export * from "./label";
export * from "./separator";
export * from "./sheet";
export * from "./sidebar";
export * from "./sonner";
export * from "./spinner";
export * from "./tooltip";
// Note: `./badge-shadcn`, `./button-shadcn`, `./card-shadcn`, `./skeleton-shadcn`,
// `./input-shadcn` are internal shadcn variants used by dialog/sidebar. The canonical
// Badge/Button/Card/Skeleton/Input are the top-level WDS exports above (Input comes
// from `./field`).
