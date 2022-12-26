import type { LoaderArgs } from "@remix-run/server-runtime";

import { logout } from "~/session.server";

export async function loader({ request }: LoaderArgs) {
  return logout(request);
}
