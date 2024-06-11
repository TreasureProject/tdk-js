import type { Project } from "@treasure-dev/tdk-core";
import { useCallback, useEffect, useState } from "react";
import { useTreasure } from "../../context";

export const useProject = () => {
  const {
    tdk: {
      projectId,
      project: { findBySlug: fetchProject },
    },
  } = useTreasure();
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<Project | undefined>();

  const refetch = useCallback(async () => {
    setIsLoading(true);
    const nextData = await fetchProject(projectId);
    setIsLoading(false);
    setData(nextData);
  }, [fetchProject, projectId]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return {
    isLoading,
    data,
    refetch,
  };
};
