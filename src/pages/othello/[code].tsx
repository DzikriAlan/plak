import type { NextPage } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import OthelloRoomPlay from "@/features/othello/components/OthelloRoomPlay";

const OthelloRoom: NextPage = () => {
  const router = useRouter();
  const code = String(router.query.code ?? "").toUpperCase();

  return (
    <>
      <Head>
        <title>Othello Online</title>
        <meta name="description" content="Main othello bersama teman lewat tautan undangan" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1, viewport-fit=cover"
        />
      </Head>
      {code ? <OthelloRoomPlay code={code} /> : null}
    </>
  );
};

export default OthelloRoom;
