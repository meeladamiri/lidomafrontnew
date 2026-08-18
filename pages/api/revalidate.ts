// https://<Site-Name>/api/revalidate?secret=<TOKEN>&path=/

import { NextApiRequest, NextApiResponse } from "next";
import path from "path";
const fs = require("fs/promises");

type search_type = "suit" | "boomgardi" | "hotel";
type clearwhat = "get_items" | "get_metas" | "get_page_data";

async function doTheClearance({
  resdata_cache_dir,
  metadata_cache_dir,
  pagedata_cache_dir,
  clear_what,
  city_id,
  search_type,
  res,
}: {
  resdata_cache_dir: string;
  metadata_cache_dir: string;
  pagedata_cache_dir: string;
  clear_what: clearwhat[];
  city_id: string; // intentionally set it to be string
  search_type: search_type[];
  res: NextApiResponse;
}) {
  const start = performance.now();
  let cleared_get_items = false;
  let cleared_get_metas = false;
  let cleared_get_page_data = false;

  const all_filenames_of_resdata: string[] = await fs.readdir(resdata_cache_dir);
  const all_filenames_of_metadata: string[] = await fs.readdir(metadata_cache_dir);
  const all_filenames_of_pagedata: string[] = await fs.readdir(pagedata_cache_dir);

  if (clear_what.includes("get_items")) {
    for (const filename of all_filenames_of_resdata) {
      let city_id_of_filename = filename.split(",")[13];
      city_id_of_filename = city_id_of_filename.replace(/^"+|"+$/g, "");

      if (city_id_of_filename == city_id) {
        await fs.unlink(resdata_cache_dir + "/" + filename);
      }
    }
    cleared_get_items = true;
  }

  if (clear_what.includes("get_metas")) {
    for (const filename of all_filenames_of_metadata) {
      let city_id_of_filename = filename.split(",")[2];
      city_id_of_filename = city_id_of_filename.replace(/^"+|"+$/g, "");

      if (city_id_of_filename == city_id) {
        await fs.unlink(metadata_cache_dir + "/" + filename);
      }
    }
    cleared_get_metas = true;
  }

  if (clear_what.includes("get_page_data")) {
    for (const filename of all_filenames_of_pagedata) {
      let city_id_of_filename = filename.split(",")[2];
      city_id_of_filename = city_id_of_filename.replace(/^"+|"+$/g, "");

      if (city_id_of_filename == city_id) {
        await fs.unlink(pagedata_cache_dir + "/" + filename);
      }
    }
    cleared_get_page_data = true;
  }

  const end = performance.now();
  const took = end - start;
  // console.log(
  //   `Removing Cache '${clear_what.join(",")}' of '${search_type.join(
  //     ","
  //   )}' with city_id=${city_id} took ${took} milliseconds`
  // );

  return {
    cleared: {
      get_items: cleared_get_items,
      get_metas: cleared_get_metas,
      get_page_data: cleared_get_page_data,
    },
    message: `Cache '${clear_what.join(",")}' of '${search_type.join(
      ","
    )}' with city_id=${city_id} cleared successfully (took: ${took.toFixed(2)} milliseconds)`,
    fa_msg: `کش موارد مشخص شده شهر با آیدی ${city_id} با موفقیت پاک شد.`,
    took,
  };
}

export default async function revalidatingHandler(req: NextApiRequest, res: NextApiResponse) {
  // console.log("env is", process.env.Lidoma_Front_Revalidating_Secret_Token);
  // console.log("req.query.secret", req.query.secret);
  if (req.query.secret !== "1fae08404205c2fef05005fac4194e00") {
    // console.log("Secrets DON'T Match");
    return res.status(401).json({ message: "Unauthorized user. Token provided is invalid." });
  }

  // #### SEARCH TYPES
  const search_types = req.query.search_types as string | undefined;
  if (!search_types) {
    return res.status(422).json({
      message: "Missing parameter. 'search_types' is not passed as query param.",
      fa_msg: "نوع صفحه سرچ را وارد کنید.",
    });
  }
  const search_types_parsed: search_type[] = JSON.parse(search_types);
  if (
    !search_types_parsed.includes("suit") &&
    !search_types_parsed.includes("boomgardi") &&
    !search_types_parsed.includes("hotel")
  ) {
    return res.status(422).json({
      message: "value provided for 'search_types' parameter is not valid.",
      fa_msg: "مقداری که برای نوع صفحه سرچ فرستادید نادرسته.",
    });
  }
  // #### SEARCH TYPES

  // #### CITY IDS
  const city_ids = req.query.city_ids as string | undefined;
  if (!city_ids) {
    return res.status(422).json({
      message: "Missing parameter. 'city_ids' is not passed as query param.",
      fa_msg: "آیدی شهر(ها) را وارد کنید.",
    });
  }
  const city_ids_parsed: number[] = JSON.parse(city_ids);
  // #### CITY IDS

  // #### CLEAR WHAT
  const clear_what = req.query.clear_what as string | undefined;
  if (!clear_what) {
    return res.status(422).json({
      message: "Missing parameter. 'clear_what' is not passed as query param.",
      fa_msg: "نگفتی چیا رو پاک کنم.",
    });
  }
  const clear_what_parsed: clearwhat[] = JSON.parse(clear_what);
  if (
    !clear_what_parsed.includes("get_items") &&
    !clear_what_parsed.includes("get_metas") &&
    !clear_what_parsed.includes("get_page_data")
  ) {
    return res.status(422).json({
      message: "value provided for 'clear_what' parameter is not valid.",
      fa_msg: "مقداری که تعیین کردی تا با اون فلان چیز رو پاک کنم درست نبود.",
    });
  }
  // #### CLEAR WHAT

  // Now we have all required parameters
  let total_time = 0;

  if (search_types_parsed.includes("suit")) {
    const suits_resdata_cache_dir = path.resolve("./Search-cache/suit/get_items");
    const suits_metadata_cache_dir = path.resolve("./Search-cache/suit/get_metas");
    const suits_pagedata_cache_dir = path.resolve("./Search-cache/suit/get_page_data");

    for (const cityId of city_ids_parsed) {
      const response = await doTheClearance({
        resdata_cache_dir: suits_resdata_cache_dir,
        metadata_cache_dir: suits_metadata_cache_dir,
        pagedata_cache_dir: suits_pagedata_cache_dir,
        clear_what: clear_what_parsed,
        city_id: cityId?.toString(),
        search_type: search_types_parsed,
        res,
      });

      total_time = total_time + response.took;
    }
  }

  if (search_types_parsed.includes("boomgardi")) {
    const boomgardi_resdata_cache_dir = path.resolve("./Search-cache/boomgardi/get_items");
    const boomgardi_metadata_cache_dir = path.resolve("./Search-cache/boomgardi/get_metas");
    const boomgardi_pagedata_cache_dir = path.resolve("./Search-cache/boomgardi/get_page_data");

    for (const cityId of city_ids_parsed) {
      const response = await doTheClearance({
        resdata_cache_dir: boomgardi_resdata_cache_dir,
        metadata_cache_dir: boomgardi_metadata_cache_dir,
        pagedata_cache_dir: boomgardi_pagedata_cache_dir,
        clear_what: clear_what_parsed,
        city_id: cityId?.toString(),
        search_type: search_types_parsed,
        res,
      });

      total_time = total_time + response.took;
    }
  }

  if (search_types_parsed.includes("hotel")) {
    const hotel_resdata_cache_dir = path.resolve("./Search-cache/hotel/get_items");
    const hotel_metadata_cache_dir = path.resolve("./Search-cache/hotel/get_metas");
    const hotel_pagedata_cache_dir = path.resolve("./Search-cache/hotel/get_page_data");

    for (const cityId of city_ids_parsed) {
      const response = await doTheClearance({
        resdata_cache_dir: hotel_resdata_cache_dir,
        metadata_cache_dir: hotel_metadata_cache_dir,
        pagedata_cache_dir: hotel_pagedata_cache_dir,
        clear_what: clear_what_parsed,
        city_id: cityId?.toString(),
        search_type: search_types_parsed,
        res,
      });

      total_time = total_time + response.took;
    }
  }

  return res.status(200).json({
    cleared: true,
    message: `Cache '${clear_what_parsed.join(",")}' of '${search_types_parsed.join(
      ","
    )}' with city_ids=${city_ids_parsed.join(",")} cleared successfully (took: ${total_time.toFixed(
      2
    )} milliseconds)`,
    fa_msg: `کش موارد مشخص شده برای شهر های داده شده با موفقیت پاک شد.`,
  });

  // return res.status(500).json({
  //   cleared: false,
  //   message: "Something went wrong. No Cache Clearing done actually.",
  //   fa_msg: "نشد کش رو پاک کنم. مجددا امتحان کنید.",
  // });
}
