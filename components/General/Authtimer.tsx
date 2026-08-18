import { useEffect, useState } from "react";
import { numberPrettier } from "utilities/prettiers";

interface ITimer {
  setFinished: (input: boolean) => void;
  hasSentCode: boolean;
  timerSeconds?: number;
}

const AuthTimer = ({ setFinished, hasSentCode, timerSeconds = 60 }: ITimer) => {
  const [seconds, setSeconds] = useState(timerSeconds);

  useEffect(() => {
    if (seconds === 0) {
      setFinished(true);
      setSeconds(timerSeconds);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seconds]);

  const handleProgress = () => {
    if (seconds > 0) {
      setSeconds((pre) => {
        return pre - 1;
      });
    }
  };

  useEffect(() => {
    let timer: NodeJS.Timer | undefined;
    if (hasSentCode) {
      timer = setInterval(handleProgress, 1000);
    } else {
      clearTimeout(timer);
    }

    return () => {
      clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasSentCode]);

  return (
    <p className="text-12 leading-21 text-[rgba(28,52,84,0.26)] font-r">
      {`${numberPrettier(Math.floor(seconds / 60))}:${numberPrettier(seconds % 60)}`}
    </p>
  );
};

export default AuthTimer;
