import type { NextPage } from "next";
import Head from "next/head";
import ChessPlay from "@/features/chess/components/ChessPlay";

const Chess: NextPage = () => {
  return (
    <>
      <Head>
        <title>Chess</title>
        <meta name="description" content="Classic chess against the Stockfish engine, right in the browser" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1, viewport-fit=cover"
        />
      </Head>
      <ChessPlay />
    </>
  );
};

export default Chess;
