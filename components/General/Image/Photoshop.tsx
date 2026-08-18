function Photoshop({
  profileImage,
  handleRotate90cw,
  handleRotate90ccw,
  handleFlipVertical,
  handleFlipHorizontal,
  handleDelete,
}: {
  profileImage: FileReader["result"];
  handleRotate90cw: () => void;
  handleRotate90ccw: () => void;
  handleFlipVertical: () => void;
  handleFlipHorizontal: () => void;
  handleDelete: () => void;
}) {
  // console.log("profileImagePreview", profileImage);

  return (
    <div className="grid grid-cols-5 gap-x-10">
      <div className="col-span-1">
        <div
          className="flex items-center justify-center w-full aspect-square typical-gray-bg rounded-10 cursor-pointer"
          onClick={() => {
            handleRotate90cw();
          }}
        >
          <i className="text-24 text-black icon-RotateRight" />
        </div>
      </div>

      <div className="col-span-1">
        <div
          className="flex items-center justify-center w-full aspect-square typical-gray-bg rounded-10 cursor-pointer"
          onClick={() => {
            handleRotate90ccw();
          }}
        >
          <i className="text-24 text-black icon-RotateLeft" />
        </div>
      </div>

      <div className="col-span-1">
        <div
          className="px-20 sm:py-20 py-12 flex items-center justify-center w-full aspect-square typical-gray-bg rounded-10 cursor-pointer"
          onClick={() => {
            handleFlipVertical();
          }}
        >
          <i className="text-24 text-black icon-VerticalFlip" />
        </div>
      </div>

      <div className="col-span-1">
        <div
          className="flex items-center justify-center w-full aspect-square typical-gray-bg rounded-10 cursor-pointer"
          onClick={() => {
            handleFlipHorizontal();
          }}
        >
          <i className="text-24 text-black icon-HorizontalFlip" />
        </div>
      </div>

      <div className="col-span-1">
        <div
          className="flex items-center justify-center w-full aspect-square bg-[rgba(255,66,56,0.1)] rounded-10 cursor-pointer"
          onClick={() => {
            handleDelete();
          }}
        >
          <i className="text-24 text-error-light icon-Delete" />
        </div>
      </div>
    </div>
  );
}

export default Photoshop;
