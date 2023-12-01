import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api";
import { isArray } from "lodash-es";

type ITimezone = {
  id: string;
  abbreviation: string;
  name: string;
  offset: number;
};

const useTimezones = (searchTerm: string) => {
  const [timezones, setTimezones] = useState<ITimezone[] | []>([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchTimezones = async () => {
      try {
        setLoading(true);
        const response = await invoke("fetch_timezones", {
          query: searchTerm,
        });
        if (!response) return;
        const results = JSON.parse(response as string);
        if (isArray(results)) {
          setTimezones(
            results.map((timezone: any) => {
              return {
                id: timezone.Id,
                abbreviation: timezone.Abbreviation,
                name: timezone.Name,
                offset: timezone.Offset,
              };
            })
          );
        }
      } catch (err: any) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    if (!searchTerm) {
      setTimezones([]);
      return;
    }
    fetchTimezones();
  }, [searchTerm]);

  const cancelSearch = () => {
    setTimezones([]);
  };

  return { timezones, error, loading, cancelSearch };
};

export default useTimezones;
