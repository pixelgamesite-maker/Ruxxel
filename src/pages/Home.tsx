import Hero from "@/components/home/Hero";
import Gate from "@/components/home/Gate";
import Sectors from "@/components/home/Sectors";
import Board from "@/components/home/Board";
import Rest from "@/components/home/Rest";
import GetOnList from "@/components/home/GetOnList";

export default function Home() {
  return (
    <>
      <Hero />
      <Gate />
      <Sectors />
      <Board />
      <Rest />
      <GetOnList />
    </>
  );
}
