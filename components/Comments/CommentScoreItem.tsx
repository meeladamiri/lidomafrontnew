import CustomRating from "components/General/Rating/CustomRating";

function CommentScoreItem({ name, score }: { name: string; score: number }) {
  return (
    <div className="flex items-center justify-between">
      <p className="text-12 leading-21 text-black font-l">{name}</p>
      <div className="flex gap-x-4">
        <span className="text-12 leading-21 text-black font-l">{`(${score})`}</span>

        <CustomRating percentage={score} width={10} height={10} />
      </div>
    </div>
  );
}

export default CommentScoreItem;
