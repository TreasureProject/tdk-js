import { useTreasure } from "@treasure/tdk-react";

export const App = () => {
  const { address, logOut } = useTreasure();

  return (
    <div className="mx-auto max-w-5xl space-y-8 p-8">
      <header className="flex flex-col items-center justify-between gap-3 sm:flex-row">
        <h1 className="text-ruby-900 text-2xl font-semibold">Login Example</h1>
      </header>
      <main>
        {address ? (
          <>
            <p>Logged in as {address}</p>
            <button onClick={logOut}>Log Out</button>
          </>
        ) : (
          <a href="http://localhost:5173/platform?redirect_uri=http://localhost:5174&chain_id=421613">
            Log in with Treasure
          </a>
        )}
      </main>
    </div>
  );
};
