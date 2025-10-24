"use client";

import { MoveLeft } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

export default function BackLogo() {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="min-h-10 w-full cursor-pointer"
      onMouseOver={() => setIsHovered(true)}
      onMouseOut={() => setIsHovered(false)}
    >
      {isHovered ? (
        <Link href="/bases">
          <MoveLeft size={20} />
        </Link>
      ) : (
        <Image src="/images/small-logo.svg" alt="Logo" width={30} height={30} />
      )}
    </div>
  );
}
