// https://<Site-Name>/api/revalidate?secret=<TOKEN>&path=/

import { NextApiRequest, NextApiResponse } from "next";

export default async function revalidatingHandler(req: NextApiRequest, res: NextApiResponse) {
  console.log("env is", process.env.Lidoma_Front_Revalidating_Secret_Token);
  console.log("req.query.secret", req.query.secret);
  if (req.query.secret !== "1fae08404205c2fef05005fac4194e00") {
    console.log("Secrets DON'T Match");
    return res.status(401).json({ message: "Unauthorized user. Token provided is invalid." });
  }

  const path = req.query.path as string | undefined;

  if (!path) {
    return res
      .status(422)
      .json({ message: "Missing parameter. 'path' is not passed as query param." });
  }

  if (path === "/s/room") {
    const id = req.query.id;

    if (!id) {
      return res
        .status(422)
        .json({ message: "Missing parameter. 'id' is not passed as query param." });
    }

    await res.revalidate(`${path}/${id}`);

    return res.status(200).json({ revalidated: true });
  }

  if (path === "/b/room") {
    const id = req.query.id;

    if (!id) {
      return res
        .status(422)
        .json({ message: "Missing parameter. 'id' is not passed as query param." });
    }

    await res.revalidate(`${path}/${id}`);

    return res.json({ revalidated: true });
  }

  if (path === "/h/room") {
    const id = req.query.id;

    if (!id) {
      return res
        .status(422)
        .json({ message: "Missing parameter. 'id' is not passed as query param." });
    }

    await res.revalidate(`${path}/${id}`);

    return res.json({ revalidated: true });
  }

  if (path === "/search/city") {
    const id = req.query.id;

    if (!id) {
      return res
        .status(422)
        .json({ message: "Missing parameter. 'id' is not passed as query param." });
    }

    await res.revalidate(`${path}/${id}`);
    await res.revalidate(`${path}/1`);

    return res.json({ revalidated: true });
  }

  if (path === "/boomgardi") {
    const id = req.query.id;

    if (!id) {
      return res
        .status(422)
        .json({ message: "Missing parameter. 'id' is not passed as query param." });
    }

    await res.revalidate(`${path}/${id}`);
    await res.revalidate(`${path}`);

    return res.json({ revalidated: true });
  }

  if (path === "/hotel") {
    const id = req.query.id;

    if (!id) {
      return res
        .status(422)
        .json({ message: "Missing parameter. 'id' is not passed as query param." });
    }

    await res.revalidate(`${path}/${id}`);
    await res.revalidate(`${path}/${encodeURIComponent("رزرو-هتل")}`);

    return res.json({ revalidated: true });
  }

  //   await res.revalidate(`/`);

  return res.status(400).json({
    revalidated: false,
    message: "None of the params matched. No Revalidation done actually",
  });
}
