export {};
// import Image from "next/image";
// import Link from "next/link";
// // import PercentBox from "components/General/PercentBox";
// import CustomRating from "../General/Rating/CustomRating";
// import ResLocationWithoutBreadCrumb from "../General/ResLocationWithoutBreadCrumb";

// function SelectedHotelCart({
//   // onShareBtnClick,
//   name,
//   provice,
//   city,
//   neighborhood,
//   //   rating,
//   //   commentsN,
//   price,
//   //   bedN,
//   //   referenceCode,
//   //   maxCapacity,
//   image,
//   residenceId,
//   //   isFastEnabled,
//   discountP,
// }: //   isLastMomentForToday,
// {
//   // onShareBtnClick: () => void;
//   name: string;
//   provice: string;
//   city: string;
//   neighborhood: string;
//   //   rating: number;
//   //   commentsN: number;
//   price: number;
//   //   bedN: number;
//   //   referenceCode: string;
//   //   maxCapacity: number;
//   image: string; // ex: "https://cdn.lidomatrip.com/web/image/product.image/46063/image/خانه-اجاره-ای-برای-مسافران-تبریز.jpg"
//   residenceId: number;
//   //   isFastEnabled: boolean;
//   discountP: number;
//   //   isLastMomentForToday: boolean;
// }) {
//   return (
//     <div>
//       <div className="relative h-[214px] w-full">
//         <Image src={image} fill style={{ objectFit: "cover" }} alt="" className="rounded-12" />

//         {/* <div
//           className={`
//               absolute top-12 left-12 right-12 flex items-center z-1
//               justify-end
//           `}
//         >
//           <div className="flex items-center gap-x-8">
//             <div>
//               <Share
//                 onShareBtnClick={onShareBtnClick}
//                 customIcon={
//                   <Image
//                     src={"/assets/non-icomoon-icons/share2.svg"}
//                     width={17}
//                     height={18}
//                     alt=""
//                   />
//                 }
//               />
//             </div>
//             <div>
//               <LikeOrNot
//                 handleClick={() => {
//                   unlikeResidenceMutation.mutate();
//                 }}
//                 isLiked={true}
//               />
//             </div>
//           </div>
//         </div> */}
//       </div>

//       <div className="mt-8">
//         <div className="flex items-center justify-between mb-4 gap-x-4">
//           <Link
//             prefetch={false}
//             href={`/residences/${residenceId}/details`}
//             className="text-14 leading-24 text-black font-r OnlyOneLineAndEndWithElipsis"
//           >
//             {name}
//           </Link>

//           <div className="gap-x-4 flex items-center shrink-0">
//             <p className="text-12 leading-16 text-black font-l">5 ستاره</p>
//             <CustomRating percentage={5} width={13} height={12} />
//           </div>
//         </div>

//         <ResLocationWithoutBreadCrumb
//           city={city}
//           className="mb-4"
//           neighborhood={neighborhood}
//           province={provice}
//         />

//         {/* <p className="text-12 leading-21 text-[rgba(28,46,69,0.6)] font-l mb-4">
//           {bedN}خوابه . تا {maxCapacity} نفر . کد ‌: {referenceCode}
//         </p> */}

//         {/* <div className="text-14 leading-24 text-black font-m flex items-center gap-x-4">
//           <p>هر شب از:</p>
//           {!!discountP && (
//             <p className="text-12 leading-21 text-gray-77828F font-l line-through">
//               {price.toLocaleString()} تومان
//             </p>
//           )}

//           <p>{(!!discountP ? price - price * (discountP / 100) : price)?.toLocaleString()} تومان</p>

//           {!!discountP && (
//             <div className="mr-8">
//               <PercentBox value={discountP} />
//             </div>
//           )}
//         </div> */}

//         {/* <div className="flex items-center gap-x-8 mt-12">
//           {!!isFastEnabled && <FastReserveBox />}

//           {!!isLastMomentForToday && <LastMomentForToday />}
//         </div> */}
//       </div>
//     </div>
//   );
// }

// export default SelectedHotelCart;
