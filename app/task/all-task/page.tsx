import { fetchAllTasksOfUser } from "../../actions/dbActions";
import AllTasksView from "@/components/AllTasksView";
export default async function Page() {
  // TODO:
  // Top: Add new weekl plan(default from today to next sunday)
  // all tasks
  // current on going task(already exist)
  // not assigned task(on pending...(they're fading out if put here 7 days))
  const { tasks: initialFetchedTasks, error: initialFetchError } =
    await fetchAllTasksOfUser();
  return (
    <>
      <div className="">
        <AllTasksView
          initialFetchedTasks={initialFetchedTasks}
          initialFetchError={initialFetchError}
        />
      </div>
    </>
  );
}
