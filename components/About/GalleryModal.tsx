import ModalWrapper from "components/General/core/ModalWrapper";
import Image from "next/image";

function GalleryModal({
  isModalOpen,
  handleClose,
  headerTitle,
}: {
  isModalOpen: boolean;
  handleClose: () => void;
  headerTitle: string;
}) {
  return (
    <ModalWrapper
      headerTitle={headerTitle}
      onClose={() => {
        handleClose();
      }}
      open={isModalOpen}
      modalClassname={"md:max-h-[90%]"}
    >
      <div>
        <div className="flex flex-row justify-center w-full gap-12 mt-12">
          <Image
            className=""
            alt=""
            src="/assets/about/gallery/gallery-2.jpg"
            width={500}
            height={500}
            style={{
              width: "100%",
              height: "auto",
            }}
          />
          <Image
            className=""
            alt=""
            src="/assets/about/gallery/gallery-1.jpg"
            width={500}
            height={500}
            style={{
              width: "100%",
              height: "auto",
            }}
          />
        </div>
        <div className="flex justify-center flex-row w-full gap-12 mt-12">
          <Image
            className=""
            alt=""
            src="/assets/about/gallery/gallery-3.jpg"
            width={500}
            height={500}
            style={{
              width: "100%",
              height: "auto",
            }}
          />
        </div>
        <div className="flex justify-center flex-row w-full gap-12 mt-12">
          <Image
            className=""
            alt=""
            src="/assets/about/gallery/gallery-11.jpg"
            width={500}
            height={500}
            style={{
              width: "100%",
              height: "auto",
            }}
          />
          <Image
            className=""
            alt=""
            src="/assets/about/gallery/gallery-4.jpg"
            width={500}
            height={500}
            style={{
              width: "100%",
              height: "auto",
            }}
          />
        </div>
        <div className="flex justify-center  flex-row w-full gap-12 mt-12">
          <Image
            className=""
            alt=""
            src="/assets/about/gallery/gallery-10.jpg"
            width={500}
            height={500}
            style={{
              width: "100%",
              height: "auto",
            }}
          />
        </div>
        <div className="flex justify-center  flex-row w-full gap-12 mt-12">
          <Image
            className=""
            alt=""
            src="/assets/about/gallery/gallery-8.jpg"
            width={500}
            height={500}
            style={{
              width: "100%",
              height: "auto",
            }}
          />
          <Image
            className=""
            alt=""
            src="/assets/about/gallery/gallery-9.jpg"
            width={500}
            height={500}
            style={{
              width: "100%",
              height: "auto",
            }}
          />
        </div>
        <div className="flex justify-center  flex-row w-full gap-12 mt-12">
          <Image
            className=""
            alt=""
            src="/assets/about/gallery/gallery-7.jpg"
            width={500}
            height={500}
            style={{
              width: "100%",
              height: "auto",
            }}
          />
        </div>
        <div className="flex flex-row justify-center  w-full gap-12 mt-12">
          <Image
            className=""
            alt=""
            src="/assets/about/gallery/gallery-5.jpg"
            width={500}
            height={500}
            style={{
              width: "100%",
              height: "auto",
            }}
          />
          <Image
            className=""
            alt=""
            src="/assets/about/gallery/gallery-4.jpg"
            width={500}
            height={500}
            style={{
              width: "100%",
              height: "auto",
            }}
          />
        </div>
        <div className="flex flex-row justify-center  w-full gap-12 mt-12">
          <Image
            className=""
            alt=""
            src="/assets/about/gallery/gallery-6.jpg"
            width={500}
            height={500}
            style={{
              width: "100%",
              height: "auto",
            }}
          />
        </div>
      </div>
    </ModalWrapper>
  );
}

export default GalleryModal;
