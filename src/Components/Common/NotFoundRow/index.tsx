export const NotFoundRow = ({ text }: { text: string }) => {
  return (
    <div className="h-full w-full bg-[#1A1A1A] p-2 cursor-pointer flex justify-center items-center space-x-2">
      {text}
    </div>
  );
};
