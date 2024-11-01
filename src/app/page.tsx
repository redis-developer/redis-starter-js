import Image from "next/image";
import Link from "next/link";

const API_URL = process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL;

export default async function Home() {
  const response = await fetch(`${API_URL}/api/helth`);
  const pong = await response.json();

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      {/* Welcome */}
      <section className="flex w-full flex-col gap-6 pt-5 md:gap-0">
        <div className="mb-8 px-0">
          <h1 className="capitalize text-6xl text-center">Welcome</h1>
          <p className="text-xl text-center">
            Get started with Redis and Node.js in seconds
          </p>
          <p className="text-center mt-2">
            To get started, see the code in&nbsp;
            <code className="font-mono font-bold">src/lib</code>
            &nbsp;and&nbsp;<code className="font-mono font-bold">src/app/api</code>
          </p>
        </div>
      </section>
      {/* /Welcome */}

      <hr className="text-[#5c707a] bg-[#5c707a] w-full max-w-7xl" />

      {/* Helth */}
      <section className="py-12 contain-layout">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 py-16">
          <h2 className="capitalize text-5xl text-display-xs sm:text-display-lg mb-3">Health check results</h2>
          <p className="text-xl">
            ping response: {pong.ping}
          </p>
          <p className="text-xl">
            time: {pong.ms}ms
          </p>
        </div>
      </section>
      {/* /Helth */}

      <hr className="text-[#5c707a] bg-[#5c707a] w-full max-w-7xl" />

      {/* Resources */}
      <section className="py-12 contain-layout">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 py-16">
          <div className="mx-auto flex w-100 flex-col items-center gap-8 text-center">
            <h2 className="capitalize text-5xl text-display-xs sm:text-display-lg">
              Learn More
            </h2>
            <p className="text-xl text-center">
              Click on the links below to learn about Redis
            </p>

            <div className="pt-10 mb-32 grid text-center lg:mb-0 lg:w-full lg:max-w-5xl lg:grid-cols-4 lg:text-left font-mono">
              <Link
                href="https://redis.io/docs/latest?utm_source=redis-node-starter&utm_campaign=redis-node-starter"
                className="hover:text-[#DCFF1E] group rounded-lg border border-transparent px-2 py-4 transition-colors hover:border-gray-300 hover:bg-[#163341] hover:dark:border-neutral-700 hover:dark:bg-[#163341]"
                target="_blank"
                rel="noopener noreferrer"
              >
                <h2 className="mb-3 text-2xl">
                  Docs{" "}
                  <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
                    -&gt;
                  </span>
                </h2>
                <p className="m-0 max-w-[30ch] text-sm opacity-50">
                  Learn about Redis products, features, and commands.
                </p>
              </Link>

              <Link
                href="https://redis.io/learn?utm_source=redis-node-starter&utm_campaign=redis-node-starter"
                className="hover:text-[#DCFF1E] group rounded-lg border border-transparent px-2 py-4 transition-colors hover:border-gray-300 hover:bg-[#163341] hover:dark:border-neutral-700 hover:dark:bg-[#163341]"
                target="_blank"
                rel="noopener noreferrer"
              >
                <h2 className="mb-3 text-2xl">
                  Learn{" "}
                  <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
                    -&gt;
                  </span>
                </h2>
                <p className="m-0 max-w-[30ch] text-sm opacity-50">
                  Read tutorials, quick starts, and how-to guides for Redis.
                </p>
              </Link>

              <Link
                href="https://redis.io/demo-center?utm_source=redis-node-starter&utm_campaign=redis-node-starter"
                className="hover:text-[#DCFF1E] group rounded-lg border border-transparent px-2 py-4 transition-colors hover:border-gray-300 hover:bg-[#163341] hover:dark:border-neutral-700 hover:dark:bg-[#163341]"
                target="_blank"
                rel="noopener noreferrer"
              >
                <h2 className="mb-3 text-2xl">
                  Demo Center{" "}
                  <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
                    -&gt;
                  </span>
                </h2>
                <p className="m-0 max-w-[30ch] text-sm opacity-50">
                  Watch short, technical videos about Redis products and
                  features.
                </p>
              </Link>

              <Link
                href="https://redis.io/insight?utm_source=redis-node-starter&utm_campaign=redis-node-starter#insight-form"
                className="hover:text-[#DCFF1E] group rounded-lg border border-transparent px-2 py-4 transition-colors hover:border-gray-300 hover:bg-[#163341] hover:dark:border-neutral-700 hover:dark:bg-[#163341]"
                target="_blank"
                rel="noopener noreferrer"
              >
                <h2 className="mb-3 text-2xl">
                  Redis Insight{" "}
                  <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
                    -&gt;
                  </span>
                </h2>
                <p className="m-0 max-w-[30ch] text-balance text-sm opacity-50">
                  Query and visualize Redis data, perform bulk operations,
                  monitor performance, and troubleshoot performance issues.
                </p>
              </Link>
            </div>
          </div>
        </div>
      </section>
      {/* /Resources */}

      <hr className="text-[#5c707a] bg-[#5c707a] w-full max-w-7xl" />

      {/* Try Free */}
      <section className="py-12 contain-layout">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 py-16">
          <div className="mx-auto flex w-100 flex-col items-center gap-8 text-center">
            <h2 className="capitalize text-5xl text-display-xs sm:text-display-lg text-white">
              Build with Redis Cloud
            </h2>
            <p className="text-[26px] text-white"></p>
            <a
              className="inline-flex items-center justify-center gap-2 text-center transition-colors w-full h-11 whitespace-nowrap font-normal font-mono bg-[#DCFF1E] text-[#091A23] rounded-[5px] border border-[#5C707A] px-8 py-[14px] text-sm hover:bg-[#163341] hover:text-white sm:w-fit"
              rel="noreferrer noopener"
              target="_blank"
              href="https://redis.io/try-free/"
            >
              Try for free
            </a>
          </div>
        </div>
      </section>
      {/* /Try Free */}
    </main>
  );
}

