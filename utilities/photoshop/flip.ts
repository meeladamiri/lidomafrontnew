function flip({
  flipVertically,
  originalImage,
}: {
  flipVertically: boolean;
  originalImage: FileReader["result"];
}) {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  //   canvas.width = window.innerWidth;
  //   canvas.height = window.innerHeight;

  //   ctx.clearRect(0, 0, canvas.width, canvas.height)

  const img = new Image();
  img.src = originalImage as string;
  img.width = 600;
  img.height = 500;

  ctx?.save();
  ctx?.scale(flipVertically ? -1 : 1, 1);
  ctx?.drawImage(img, flipVertically ? img.width * -1 : 0, 0, img.width, img.height);
  ctx?.restore();
}

export {};
