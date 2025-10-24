"use client";

import { MoveLeft } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

export default function BackLogo() {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="flex min-h-8 w-full cursor-pointer items-center"
      onMouseOver={() => setIsHovered(true)}
      onMouseOut={() => setIsHovered(false)}
    >
      {isHovered ? (
        <Link href="/bases">
          <MoveLeft size={15} />
        </Link>
      ) : (
        <Image src="/images/small-logo.svg" alt="Logo" width={25} height={25} />
      )}
    </div>
  );
}
