import classes from "styles/custom-loader.module.css";

const TinyLoader = () => {
  return (
    <div
      // className="my-64 flex w-full justify-center "
      className="my-32 flex w-full justify-center "
    >
      <div className={`${classes["dot-flashing"]}`}></div>
      {/* <Image
        alt="loader"
        src="/assets/loader1.svg"
        height={112}
        width={112}
        style={{
          maxWidth: "100%",
          height: "auto",
        }}
      /> */}
      {/* <object
        id="svg1"
        data="/assets/loader1.svg"
        type="image/svg+xml"
        className="w-[112px] h-[112px]"
      ></object> */}
    </div>
  );
};

export { TinyLoader };
