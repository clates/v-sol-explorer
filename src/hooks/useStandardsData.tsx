import { useState, useEffect } from "react";
import { SubjectStandard } from "../types";

const CACHE_VERSION = "1.0"; // Update this version to bust the cache

const useStandardsData = ({ useCache = true }) => {
  const [standardsData, setStandardsData] = useState<SubjectStandard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (useCache) {
      const cachedData = localStorage.getItem("standardsData");
      const cachedVersion = localStorage.getItem("standardsDataVersion");

      if (cachedData && cachedVersion === CACHE_VERSION) {
        try {
          const parsedData = JSON.parse(cachedData) as SubjectStandard[];
          setStandardsData(parsedData);
          setLoading(false);
          return; // Data loaded from cache
        } catch {
          // Handle parsing errors, clear cache if needed
          localStorage.removeItem("standardsData");
          localStorage.removeItem("standardsDataVersion");
        }
      }
    }

    const URL_PREFIX =
      import.meta.env.BASE_URL !== "/" ? `${import.meta.env.BASE_URL}` : "";
    const urls = [
      `${URL_PREFIX}standards/computer_science.json`,
      `${URL_PREFIX}standards/english_writing.json`,
      `${URL_PREFIX}standards/history.json`,
      `${URL_PREFIX}standards/mathematics.json`,
      `${URL_PREFIX}standards/science.json`,
      // Add more URLs as needed
    ];

    console.log(urls);
    Promise.all(
      urls.map((url) =>
        fetch(url).then((res) => {
          if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
          }
          return res.json();
        })
      )
    )
      .then((results) => {
        const combinedData = results.flat() as SubjectStandard[];
        setStandardsData(combinedData);
        if (useCache) {
          localStorage.setItem("standardsData", JSON.stringify(combinedData)); // Cache the data
          localStorage.setItem("standardsDataVersion", CACHE_VERSION); // Cache the version
        }
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message); // Store error message
        setLoading(false);
      });
  }, [useCache]); // Dependency array includes useCache

  return { standardsData, loading, error };
};

export default useStandardsData;
