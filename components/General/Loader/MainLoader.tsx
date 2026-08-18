import classes from "styles/custom-loader.module.css";

const MainLoader = ({ isLoading }: { isLoading: boolean }) => {
  return (
    <div
      className={`
        fixed top-0 right-0 z-[999] flex h-full w-full 
        items-center justify-center bg-[#d0d0d059]        
      `}
      style={{
        display: isLoading ? "flex" : "none",
      }}
    >
      <div className="absolute w-[80px] h-[80px] bg-white rounded-6"></div>
      <div className={`${classes["dot-flashing"]}`}>
        {/* <Image
          alt="loader"
          src="/assets/loader1.svg"
          height={260}
          width={260}
          style={{
            maxWidth: "100%",
            height: "auto",
          }}
        /> */}
        {/* <object
          id="svg1"
          data="/assets/loader1.svg"
          type="image/svg+xml"
          className="w-[260px] h-[260px]"
        ></object> */}
      </div>
    </div>
  );
};

export default MainLoader;
