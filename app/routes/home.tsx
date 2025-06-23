import type { Route } from "./+types/home";
import App from "../../src/App";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Home" }];
}

export default function Home() {
  return <App />;
}
