import { useRef } from "react";

interface IUpload {
  image: any;
  setImage: any;
  text: string;
  setImagePreview?: any;
}

function readFile(file: any): Promise<FileReader["result"]> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.addEventListener("load", () => resolve(reader.result), false);
    reader.readAsDataURL(file);
  });
}

function Upload({ image, setImage, text, setImagePreview }: IUpload) {
  const realFileBtn = useRef<any>();

  const onFileChange = async (e: any) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      let imageDataUrl = await readFile(file);

      setImage(imageDataUrl);
    }
  };

  return (
    <div className="px-20 py-24 flex flex-col items-center rounded-12 border-1 border-dashed border-black">
      <div className="w-48 h-48 rounded-full bg-[rgba(3,214,187,0.1)] mb-12 flex items-center justify-center">
        <i className="icon-Photo text-primary-main text-30" />
      </div>

      <p className="text-14 leading-24 text-black font-m mb-16">{text}</p>

      <div
        className="py-8 px-16 flex items-center gap-x-4 typical-gray-bg rounded-50 cursor-pointer"
        onClick={() => realFileBtn.current.click()}
      >
        <i className="icon-Upload text-black text-24" />

        <p className="text-14 leading-24 text-black font-m ">بارگذاری عکس</p>

        <input
          type="file"
          hidden={true}
          ref={realFileBtn}
          accept="image/jpeg ,image/jpg, image/png, image/webp"
          onChange={(e) => onFileChange(e)}
        />
      </div>
    </div>
  );
}

export default Upload;
