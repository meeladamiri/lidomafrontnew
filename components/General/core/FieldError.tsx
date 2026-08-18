function ErrorTag({ marginTopClass, errorText }: { marginTopClass?: string; errorText: string }) {
  return (
    <p className={`${marginTopClass || "mt-4"} text-10 leading-17 text-error-light font-l`}>
      {errorText}
    </p>
  );
}

function FieldError({
  errorMessage,
  marginTopClass,
}: {
  errorMessage: string | null;
  marginTopClass?: string;
}) {
  if (errorMessage) {
    return <ErrorTag marginTopClass={marginTopClass} errorText={errorMessage} />;
  } else {
    return null;
  }
}

export default FieldError;
