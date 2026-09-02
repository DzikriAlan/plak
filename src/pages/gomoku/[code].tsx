import type { NextPage } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import GomokuRoomPlay from "@/features/gomoku/components/GomokuRoomPlay";

const GomokuRoom: NextPage = () => {
  const router = useRouter();
  const code = String(router.query.code ?? "").toUpperCase();

  return (
    <>
      <Head>
        <title>Gomoku Online</title>
        <meta name="description" content="Main gomoku bersama teman lewat tautan undangan" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1, viewport-fit=cover"
        />
      </Head>
      {code ? <GomokuRoomPlay code={code} /> : null}
    </>
  );
};

export default GomokuRoom;
