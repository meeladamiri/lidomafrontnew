import Link from "next/link";

export function CreateLink({ text, linkTo }: { text: string; linkTo: string }) {
  return (
    <Link
      passHref
      prefetch={false}
      href={linkTo}
      className="py-9 w-full bg-white border-gray-E9E9EC border-1 border-solid rounded-10
       md:text-12 text-10 cursor-pointer flex justify-center items-center px-4 md:px-8"
    >
      {text}
    </Link>
  );
}
