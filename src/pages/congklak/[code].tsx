import type { NextPage } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import CongklakRoomPlay from "@/features/congklak/components/CongklakRoomPlay";

const CongklakRoom: NextPage = () => {
  const router = useRouter();
  const code = String(router.query.code ?? "").toUpperCase();

  return (
    <>
      <Head>
        <title>Congklak Online</title>
        <meta name="description" content="Main congklak bersama teman lewat tautan undangan" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1, viewport-fit=cover"
        />
      </Head>
      {code ? <CongklakRoomPlay code={code} /> : null}
    </>
  );
};

export default CongklakRoom;
