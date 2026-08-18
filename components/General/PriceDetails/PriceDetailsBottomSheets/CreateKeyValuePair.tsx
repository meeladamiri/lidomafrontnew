function CreateKeyValuePair({ keyy, value }: { keyy: string; value: number }) {
  return (
    <div className="pb-12 last:pb-0 mb-12 last:mb-0 border-b-1 border-dashed border-b-gray-CACFD3 last:border-b-none flex items-center justify-between">
      <p className="text-12 leading-21 text-black font-r">{keyy}</p>

      <p className="text-12 leading-21 text-black font-r">{value?.toLocaleString()} تومان</p>
    </div>
  );
}

export default CreateKeyValuePair;
