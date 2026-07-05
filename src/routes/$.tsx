import { createFileRoute } from "@tanstack/react-router";
import { ClientApp } from "@/client-app";

export const Route = createFileRoute("/$")({
  component: ClientApp,
});
