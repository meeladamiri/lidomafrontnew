function AnimatedPingAlert() {
  return (
    <span className="relative flex justify-center items-center h-10 w-10 shrink-0">
      <span className="animate-ping absolute h-full w-full rounded-full bg-[#FFBB00] opacity-75"></span>
      <span className="relative inline-flex rounded-full h-6 w-6 bg-[#FFBB00]"></span>
    </span>
  );
}
export default AnimatedPingAlert;
