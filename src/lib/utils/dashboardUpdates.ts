import { talentJobsApi } from "@/lib/utils/talentJobs";
import { notificationsApi } from "@/lib/api/notification";

export interface UpdateItem {
  id: string;
  title: string;
  description: string;
  timestamp: string;
}

export async function getLatestUpdates(email: string, limit = 4): Promise<UpdateItem[]> {
  const fromNotifications: UpdateItem[] = notificationsApi.getAll(email).map((n) => ({
    id: n.id,
    title: n.message,
    description: "",
    timestamp: n.createdAt,
  }));

  const allJobs = await talentJobsApi.getAll();

  const fromJobs: UpdateItem[] = allJobs
    .filter((job) => job.postedDaysAgo <= 5)
    .map((job) => ({
      id: `job-${job.id}`,
      title: `New job: ${job.title}`,
      description: `${job.company} · ${job.location}`,
      timestamp: new Date(Date.now() - job.postedDaysAgo * 86_400_000).toISOString(),
    }));

  return [...fromNotifications, ...fromJobs]
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, limit);
}