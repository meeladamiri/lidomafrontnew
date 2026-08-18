function PercentBox({ value, className }: { value: number; className?: string }) {
  return (
    <p
      className={`
        px-8 py-2 rounded-full bg-error-light text-12 leading-16 text-white font-m
        ${className || ""}
      `}
    >
      %{value}
    </p>
  );
}

export default PercentBox;
