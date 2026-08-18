import { Lidoma_Features } from "@/constants/Lidoma_Features";
import LidomaFeatureItem from "./LidomaFeatureItem";

function LidomaFeaturesDesktop() {
  return (
    <div className="hidden md:grid grid-cols-12 gap-x-16">
      {Lidoma_Features.map((item, index: number) => {
        return (
          <LidomaFeatureItem
            key={index}
            icon={item.icon}
            title={item.title}
            description={item.description}
          />
        );
      })}
    </div>
  );
}

export default LidomaFeaturesDesktop;
