import AddTasksFromText from "@/components/AddTasksFromText";
import { fetchAllTasksOfUser } from "../../actions/dbActions";
export default async function Page() {
  // TODO:
  // Top: Add new weekl plan(default from today to next sunday)
  // all tasks
  // current on going task(already exist)
  // not assigned task(on pending...(they're fading out if put here 7 days))
  const { tasks: initialTasks, error } = await fetchAllTasksOfUser();
  return (
    <>
      <div className="">manage all your tasks</div>
    </>
  );
}
