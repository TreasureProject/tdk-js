import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { tdk } from "~/utils/tdk";

export const loader = async ({ params }: LoaderFunctionArgs) => {
  const { slug = "platform" } = params;
  try {
    const project = await tdk.project.findBySlug(slug);
    return json({ project });
  } catch (err) {
    console.error("Error fetching project details:", err);
    throw new Response(null, {
      status: 404,
      statusText: "Not Found",
    });
  }
};

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  return [{ title: `Log in to ${data?.project.name}` }];
};

export default function Index() {
  return (
    <div style={{ fontFamily: "system-ui, sans-serif", lineHeight: "1.8" }}>
      <h1 className="text-red-400">Welcome to Remix</h1>
      <ul>
        <li>
          <a
            target="_blank"
            href="https://remix.run/tutorials/blog"
            rel="noreferrer"
          >
            15m Quickstart Blog Tutorial
          </a>
        </li>
        <li>
          <a
            target="_blank"
            href="https://remix.run/tutorials/jokes"
            rel="noreferrer"
          >
            Deep Dive Jokes App Tutorial
          </a>
        </li>
        <li>
          <a target="_blank" href="https://remix.run/docs" rel="noreferrer">
            Remix Docs
          </a>
        </li>
      </ul>
    </div>
  );
}
