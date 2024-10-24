import Link from "next/link";
import React from "react";
import { FaXTwitter } from "react-icons/fa6";
import { PiTelegramLogoLight } from "react-icons/pi";
import { TfiEmail } from "react-icons/tfi";
import Image from "next/image";

export default function Footer() {
  return (
    <footer className="footer p-6 sm:p-8 md:p-12 bg-headerblack text-white">
      <div className="flex flex-col md:flex-row justify-between items-center w-full">
        <div className="flex flex-col justify-center md:flex-row items-center gap-4 md:gap-8">
          <button className="btn bg-headerblack text-xl border-none">
            <Image
              src="/mglwhite.png"
              alt="MGL Logo"
              width={40}
              height={40}
              className="h-10 w-10"
            />
			<p className="mx-4 font-thin">METRICS GARDEN LABS</p>
          </button>
        
        </div>
        <div className="mt-4 md:mt-0 md:ml-auto flex gap-4 items-center justify-end">
          <Link
            href="https://x.com/metricsgarden"
            target="_blank"
            className="flex items-center"
          >
            <FaXTwitter className="text-white text-lg w-6 h-6 hover:text-opacity-75" />
          </Link>
          <Link
            href="https://t.me/+yFClKgNH2y80N2Fh"
            target="_blank"
            className="flex items-center"
          >
            <PiTelegramLogoLight className="text-white text-lg w-6 h-6 hover:text-opacity-75" />
          </Link>
          <Link
            className="flex items-center"
            href="mailto:launamu@metricsgarden.xyz"
          >
            <TfiEmail className="text-white text-lg w-6 h-6 hover:text-opacity-75" />
          </Link>
        </div>
      </div>
    </footer>
  );
}
