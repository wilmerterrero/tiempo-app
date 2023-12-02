import { useIndexedDB } from "react-indexed-db-hook";

const useDB = () => {
  const { add, getAll, update, deleteRecord } = useIndexedDB("timezones");

  const addTimezone = async (timezone: Timezone) => {
    try {
      const result = await add(timezone);
      console.log("Timezone added successfully:", result);
      return result;
    } catch (error) {
      console.error("Failed to add timezone:", error);
    }
  };

  const fetchTimezones = async () => {
    try {
      const timezones = (await getAll()) as Timezone[];
      return timezones;
    } catch (error) {
      console.error("Failed to fetch timezones:", error);
    }
  };

  const updateTimezone = async (
    id: string,
    updatedData: Exclude<Timezone, "id">
  ) => {
    try {
      const result = await update({ ...updatedData, id });
      console.log("Timezone updated successfully:", result);
      return result;
    } catch (error) {
      console.error("Failed to update timezone:", error);
    }
  };

  const deleteTimezone = async (id: string) => {
    try {
      await deleteRecord(id);
      console.log("Timezone deleted successfully");
    } catch (error) {
      console.error("Failed to delete timezone:", error);
    }
  };

  return {
    addTimezone,
    fetchTimezones,
    updateTimezone,
    deleteTimezone,
  };
};

export default useDB;
