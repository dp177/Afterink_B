import Sidebar from "../../components/Sidebar";
import TaskOverviewCards from "./TaskOverviewCards";
import MemberOverviewCards from "./MemberOverviewCards";

export default function Dashboard() {
  return (
    <div className="flex h-screen bg-[#17171e]">
      {/* Sidebar: fixed width, vertical layout */}
      {/* <aside className="w-64 flex-shrink-0 h-full overflow-y-auto">
        <Sidebar />
      </aside> */}

      {/* Main content: flexible area, scrollable */}
      <main className="flex-1 overflow-y-auto px-10 py-8 space-y-12">
        <TaskOverviewCards />
        <MemberOverviewCards />
      </main>
    </div>
  );
}
