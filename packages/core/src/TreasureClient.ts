import { PlatformAPIClient } from "./platform/api";

type Options = {
  platformBaseUri?: string;
};

export class TreasureClient {
  projectId?: string;
  platform: PlatformAPIClient;

  constructor(projectId?: string, opts?: Options) {
    this.projectId = projectId;
    this.platform = new PlatformAPIClient(opts?.platformBaseUri, projectId);
  }
}
