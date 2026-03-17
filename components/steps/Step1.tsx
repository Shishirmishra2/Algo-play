import logo from "@/public/logo/logo.png";
import Image from "next/image";

export default function Step1() {
  return (
    <>
      <Image src={logo} alt="logo" className="size-28 sm:size-40" />
      <h1 className="-mt-10 sm:-mt-18 text-2xl sm:text-3xl">
        <span className="font-bold">Algo</span>Play
      </h1>
      <p className="mt-auto text-2xl sm:text-3xl text-center font-semibold px-4">
        From Bugs to{" "}
        <span className="text-purple-500 font-bold">Bonuses</span>{" "}
        <br /> Master Coding with Fun!
      </p>
    </>
  );
}

