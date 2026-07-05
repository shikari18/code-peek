import type { ReactNode } from "react";
import { TopBar } from "./TopBar";

export function PhoneShell({ children, showTopBar = true }: { children: ReactNode; showTopBar?: boolean }) {
  return (
    <div className="flex-1 flex flex-col overflow-y-auto">
      {showTopBar && <TopBar />}
      <main className="flex-1 flex flex-col">{children}</main>
    </div>
  );
}
