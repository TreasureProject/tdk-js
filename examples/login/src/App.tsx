import { TreasureLoginButton, useTreasure } from "@treasure/tdk-react";

export const App = () => {
  const { address, logOut } = useTreasure();

  return (
    <div className="mx-auto max-w-5xl space-y-8 p-8">
      <header className="flex items-center justify-between gap-3">
        <h1 className="text-ruby-900 text-2xl font-semibold">
          TDK Login Example
        </h1>
      </header>
      <main>
        {address ? (
          <>
            <p>Logged in as {address}</p>
            <button onClick={logOut}>Log Out</button>
          </>
        ) : (
          <TreasureLoginButton />
        )}
      </main>
    </div>
  );
};
