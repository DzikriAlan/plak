import type { NextPage } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import DotsAndBoxesRoomPlay from "@/features/dots-and-boxes/components/DotsAndBoxesRoomPlay";

const DotsAndBoxesRoom: NextPage = () => {
  const router = useRouter();
  const code = String(router.query.code ?? "").toUpperCase();

  return (
    <>
      <Head>
        <title>Dots &amp; Box Online</title>
        <meta name="description" content="Main titik dan kotak bersama teman lewat tautan undangan" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1, viewport-fit=cover"
        />
      </Head>
      {code ? <DotsAndBoxesRoomPlay code={code} /> : null}
    </>
  );
};

export default DotsAndBoxesRoom;
