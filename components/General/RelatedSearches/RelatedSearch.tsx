import Link from "next/link";

function RelatedSearch({
  name,
  linkTo,
  searchIconClassname,
}: {
  name: string;
  linkTo: string;
  searchIconClassname?: string;
}) {
  return (
    <Link
      passHref
      href={linkTo}
      prefetch={false}
      className="bg-white rounded-10 p-12 flex items-center justify-between group"
    >
      <p>{name}</p>
    </Link>
  );
}

export default RelatedSearch;
