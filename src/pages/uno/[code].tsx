import type { NextPage } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import UnoRoomPlay from "@/features/uno/components/UnoRoomPlay";

const UnoRoom: NextPage = () => {
  const router = useRouter();
  const code = String(router.query.code ?? "").toUpperCase();

  return (
    <>
      <Head>
        <title>UNO Online</title>
        <meta name="description" content="Main UNO bersama teman lewat tautan undangan" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1, viewport-fit=cover"
        />
      </Head>
      {code ? <UnoRoomPlay code={code} /> : null}
    </>
  );
};

export default UnoRoom;
