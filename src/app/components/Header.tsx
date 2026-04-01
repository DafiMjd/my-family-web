import Image from "next/image";

export default function Header() {
  return (
    <header className="relative flex items-center w-full h-11 pt-8 bg-[#F2F2F2] border-b border-gray-100">
      <Image
        src="/tree.svg"
        alt="Family Tree"
        width={44}
        height={44}
        className="ml-[7px] shrink-0"
        priority
      />
      <span className="absolute left-1/2 -translate-x-1/2 text-[16px] font-semibold text-[#242424] font-sora leading-none">
        Pohon Keluarga
      </span>
    </header>
  );
}
