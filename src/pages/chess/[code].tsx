import type { NextPage } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import ChessRoomPlay from "@/features/chess/components/ChessRoomPlay";

const ChessRoom: NextPage = () => {
  const router = useRouter();
  const code = String(router.query.code ?? "").toUpperCase();

  return (
    <>
      <Head>
        <title>Chess Online</title>
        <meta name="description" content="Main catur bersama teman lewat tautan undangan" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1, viewport-fit=cover"
        />
      </Head>
      {code ? <ChessRoomPlay code={code} /> : null}
    </>
  );
};

export default ChessRoom;
